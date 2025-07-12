// User management related SQL queries

export const userQueries = {
  // Create new user
  createUser: `
    INSERT INTO users (
      email, password_hash, first_name, last_name, 
      phone, role, email_verification_token
    ) VALUES ($1, $2, $3, $4, $5, $6, $7) 
    RETURNING id, email, first_name, last_name, phone, role, status, created_at;
  `,

  // Get user by email
  getUserByEmail: `
    SELECT 
      u.*,
      up.avatar_url,
      up.date_of_birth,
      up.gender,
      up.dietary_preferences,
      up.allergies,
      up.preferred_language,
      up.notification_preferences
    FROM users u
    LEFT JOIN user_profiles up ON u.id = up.user_id
    WHERE u.email = $1;
  `,

  // Get user by ID
  getUserById: `
    SELECT 
      u.*,
      up.avatar_url,
      up.date_of_birth,
      up.gender,
      up.dietary_preferences,
      up.allergies,
      up.preferred_language,
      up.notification_preferences
    FROM users u
    LEFT JOIN user_profiles up ON u.id = up.user_id
    WHERE u.id = $1;
  `,

  // Update user profile
  updateUserProfile: `
    UPDATE users 
    SET 
      first_name = $2,
      last_name = $3,
      phone = $4,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 
    RETURNING id, email, first_name, last_name, phone, role, status;
  `,

  // Update user password
  updateUserPassword: `
    UPDATE users 
    SET 
      password_hash = $2,
      password_reset_token = NULL,
      password_reset_expires = NULL,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 
    RETURNING id, email;
  `,

  // Verify email
  verifyEmail: `
    UPDATE users 
    SET 
      email_verified = true,
      email_verification_token = NULL,
      email_verification_expires = NULL,
      status = 'active',
      updated_at = CURRENT_TIMESTAMP
    WHERE email_verification_token = $1 
      AND email_verification_expires > NOW()
    RETURNING id, email, first_name, last_name;
  `,

  // Set password reset token
  setPasswordResetToken: `
    UPDATE users 
    SET 
      password_reset_token = $2,
      password_reset_expires = NOW() + INTERVAL '1 hour',
      updated_at = CURRENT_TIMESTAMP
    WHERE email = $1 
    RETURNING id, email, first_name, last_name;
  `,

  // Update last login
  updateLastLogin: `
    UPDATE users 
    SET 
      last_login = CURRENT_TIMESTAMP,
      login_attempts = 0,
      locked_until = NULL,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $1;
  `,

  // Increment login attempts
  incrementLoginAttempts: `
    UPDATE users 
    SET 
      login_attempts = login_attempts + 1,
      locked_until = CASE 
        WHEN login_attempts >= 4 THEN NOW() + INTERVAL '30 minutes'
        ELSE locked_until
      END,
      updated_at = CURRENT_TIMESTAMP
    WHERE email = $1
    RETURNING login_attempts, locked_until;
  `,

  // Get user addresses
  getUserAddresses: `
    SELECT * FROM user_addresses 
    WHERE user_id = $1 
    ORDER BY is_default DESC, created_at DESC;
  `,

  // Add user address
  addUserAddress: `
    INSERT INTO user_addresses (
      user_id, label, street_address, city, state, 
      postal_code, country, latitude, longitude, is_default
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
    RETURNING *;
  `,

  // Update user address
  updateUserAddress: `
    UPDATE user_addresses 
    SET 
      label = $3,
      street_address = $4,
      city = $5,
      state = $6,
      postal_code = $7,
      country = $8,
      latitude = $9,
      longitude = $10,
      is_default = $11,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND user_id = $2 
    RETURNING *;
  `,

  // Delete user address
  deleteUserAddress: `
    DELETE FROM user_addresses 
    WHERE id = $1 AND user_id = $2 
    RETURNING *;
  `,

  // Set default address
  setDefaultAddress: `
    UPDATE user_addresses 
    SET is_default = CASE WHEN id = $2 THEN true ELSE false END
    WHERE user_id = $1;
  `,

  // Create or update user profile
  upsertUserProfile: `
    INSERT INTO user_profiles (
      user_id, avatar_url, date_of_birth, gender,
      dietary_preferences, allergies, preferred_language,
      notification_preferences
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    ON CONFLICT (user_id) 
    DO UPDATE SET
      avatar_url = EXCLUDED.avatar_url,
      date_of_birth = EXCLUDED.date_of_birth,
      gender = EXCLUDED.gender,
      dietary_preferences = EXCLUDED.dietary_preferences,
      allergies = EXCLUDED.allergies,
      preferred_language = EXCLUDED.preferred_language,
      notification_preferences = EXCLUDED.notification_preferences,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *;
  `,

  // Get users by role
  getUsersByRole: `
    SELECT 
      u.id, u.email, u.first_name, u.last_name, 
      u.phone, u.role, u.status, u.created_at,
      up.avatar_url
    FROM users u
    LEFT JOIN user_profiles up ON u.id = up.user_id
    WHERE u.role = $1
    ORDER BY u.created_at DESC
    LIMIT $2 OFFSET $3;
  `,

  // Update user status
  updateUserStatus: `
    UPDATE users 
    SET 
      status = $2,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 
    RETURNING id, email, first_name, last_name, status;
  `,

  // Get delivery persons
  getDeliveryPersons: `
    SELECT 
      u.id, u.email, u.first_name, u.last_name, 
      u.phone, u.status, u.last_login,
      COUNT(o.id) as active_orders
    FROM users u
    LEFT JOIN orders o ON u.id = o.assigned_to 
      AND o.status IN ('confirmed', 'preparing', 'ready', 'out_for_delivery')
    WHERE u.role = 'delivery_person' AND u.status = 'active'
    GROUP BY u.id, u.email, u.first_name, u.last_name, u.phone, u.status, u.last_login
    ORDER BY active_orders ASC, u.last_login DESC;
  `,

  // Get restaurant staff
  getRestaurantStaff: `
    SELECT 
      u.id, u.email, u.first_name, u.last_name, 
      u.phone, u.role, u.status, rs.position, rs.hire_date
    FROM users u
    JOIN restaurant_staff rs ON u.id = rs.user_id
    WHERE rs.restaurant_id = $1 AND rs.is_active = true
    ORDER BY u.role, rs.hire_date DESC;
  `,

  // Add staff to restaurant
  addRestaurantStaff: `
    INSERT INTO restaurant_staff (restaurant_id, user_id, position, hire_date)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (restaurant_id, user_id) 
    DO UPDATE SET
      position = EXCLUDED.position,
      hire_date = EXCLUDED.hire_date,
      is_active = true,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *;
  `,

  // Remove staff from restaurant
  removeRestaurantStaff: `
    UPDATE restaurant_staff 
    SET 
      is_active = false,
      updated_at = CURRENT_TIMESTAMP
    WHERE restaurant_id = $1 AND user_id = $2 
    RETURNING *;
  `,

  // Get user statistics
  getUserStats: `
    SELECT 
      u.id,
      u.first_name || ' ' || u.last_name as full_name,
      u.email,
      u.role,
      COUNT(DISTINCT o.id) as total_orders,
      COALESCE(SUM(CASE WHEN o.status = 'delivered' THEN o.total_amount END), 0) as total_spent,
      COUNT(DISTINCT o.restaurant_id) as unique_restaurants_ordered,
      COUNT(DISTINCT rr.id) as total_reviews_given,
      COALESCE(AVG(rr.rating), 0) as avg_rating_given
    FROM users u
    LEFT JOIN orders o ON u.id = o.customer_id
    LEFT JOIN restaurant_reviews rr ON u.id = rr.user_id
    WHERE u.id = $1
    GROUP BY u.id, u.first_name, u.last_name, u.email, u.role;
  `,

  // Search users
  searchUsers: `
    SELECT 
      u.id, u.email, u.first_name, u.last_name, 
      u.phone, u.role, u.status, u.created_at
    FROM users u
    WHERE (
      u.first_name ILIKE $1 
      OR u.last_name ILIKE $1 
      OR u.email ILIKE $1 
      OR u.phone ILIKE $1
    )
    AND ($2::user_role IS NULL OR u.role = $2)
    AND ($3::user_status IS NULL OR u.status = $3)
    ORDER BY u.created_at DESC
    LIMIT $4 OFFSET $5;
  `,

  // Get user login history (if you want to track this)
  getUserLoginHistory: `
    SELECT 
      login_time,
      ip_address,
      user_agent,
      login_successful
    FROM user_login_history 
    WHERE user_id = $1 
    ORDER BY login_time DESC 
    LIMIT $2;
  `,

  // Bulk update user status
  bulkUpdateUserStatus: `
    UPDATE users 
    SET 
      status = $2,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ANY($1::uuid[])
    RETURNING id, email, first_name, last_name, status;
  `
};