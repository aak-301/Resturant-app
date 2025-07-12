// Order management related SQL queries

export const orderQueries = {
  // Create a new order
  createOrder: `
    INSERT INTO orders (
      order_number, customer_id, restaurant_id, delivery_type, 
      subtotal, tax_amount, delivery_fee, discount_amount, 
      tip_amount, total_amount, payment_method, delivery_address_id,
      delivery_instructions, special_instructions
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
    ) RETURNING *;
  `,

  // Add item to order
  addOrderItem: `
    INSERT INTO order_items (
      order_id, food_item_id, quantity, unit_price, 
      total_price, special_instructions, selected_variants
    ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;
  `,

  // Get order by ID with items
  getOrderById: `
    SELECT 
      o.*,
      r.name as restaurant_name,
      r.phone as restaurant_phone,
      u.first_name || ' ' || u.last_name as customer_name,
      u.phone as customer_phone,
      ua.street_address || ', ' || ua.city || ', ' || ua.state || ' ' || ua.postal_code as delivery_address,
      json_agg(
        json_build_object(
          'id', oi.id,
          'food_item_id', oi.food_item_id,
          'food_item_name', fi.name,
          'quantity', oi.quantity,
          'unit_price', oi.unit_price,
          'total_price', oi.total_price,
          'special_instructions', oi.special_instructions,
          'selected_variants', oi.selected_variants,
          'image_url', fi.image_url
        )
      ) as order_items
    FROM orders o
    JOIN restaurants r ON o.restaurant_id = r.id
    JOIN users u ON o.customer_id = u.id
    LEFT JOIN user_addresses ua ON o.delivery_address_id = ua.id
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN food_items fi ON oi.food_item_id = fi.id
    WHERE o.id = $1
    GROUP BY o.id, r.name, r.phone, u.first_name, u.last_name, u.phone, ua.street_address, ua.city, ua.state, ua.postal_code;
  `,

  // Get orders by customer
  getOrdersByCustomer: `
    SELECT 
      o.*,
      r.name as restaurant_name,
      r.logo_url as restaurant_logo,
      COUNT(oi.id) as total_items
    FROM orders o
    JOIN restaurants r ON o.restaurant_id = r.id
    LEFT JOIN order_items oi ON o.id = oi.order_id
    WHERE o.customer_id = $1
    GROUP BY o.id, r.name, r.logo_url
    ORDER BY o.created_at DESC
    LIMIT $2 OFFSET $3;
  `,

  // Get orders by restaurant
  getOrdersByRestaurant: `
    SELECT 
      o.*,
      u.first_name || ' ' || u.last_name as customer_name,
      u.phone as customer_phone,
      COUNT(oi.id) as total_items
    FROM orders o
    JOIN users u ON o.customer_id = u.id
    LEFT JOIN order_items oi ON o.id = oi.order_id
    WHERE o.restaurant_id = $1
      AND ($2::order_status IS NULL OR o.status = $2)
    GROUP BY o.id, u.first_name, u.last_name, u.phone
    ORDER BY o.created_at DESC
    LIMIT $3 OFFSET $4;
  `,

  // Update order status
  updateOrderStatus: `
    UPDATE orders 
    SET status = $2, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 
    RETURNING *;
  `,

  // Assign delivery person to order
  assignDeliveryPerson: `
    UPDATE orders 
    SET assigned_to = $2, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 
    RETURNING *;
  `,

  // Update order delivery time
  updateDeliveryTime: `
    UPDATE orders 
    SET estimated_delivery_time = $2, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 
    RETURNING *;
  `,

  // Mark order as delivered
  markOrderDelivered: `
    UPDATE orders 
    SET 
      status = 'delivered',
      actual_delivery_time = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 
    RETURNING *;
  `,

  // Get active orders for delivery person
  getActiveOrdersForDelivery: `
    SELECT 
      o.*,
      r.name as restaurant_name,
      r.street_address as restaurant_address,
      r.phone as restaurant_phone,
      u.first_name || ' ' || u.last_name as customer_name,
      u.phone as customer_phone,
      ua.street_address || ', ' || ua.city || ', ' || ua.state || ' ' || ua.postal_code as delivery_address
    FROM orders o
    JOIN restaurants r ON o.restaurant_id = r.id
    JOIN users u ON o.customer_id = u.id
    LEFT JOIN user_addresses ua ON o.delivery_address_id = ua.id
    WHERE o.assigned_to = $1 
      AND o.status IN ('confirmed', 'preparing', 'ready', 'out_for_delivery')
    ORDER BY o.estimated_delivery_time ASC;
  `,

  // Get order statistics for restaurant
  getRestaurantOrderStats: `
    SELECT 
      COUNT(*) as total_orders,
      COUNT(CASE WHEN status = 'delivered' THEN 1 END) as completed_orders,
      COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders,
      COALESCE(SUM(CASE WHEN status = 'delivered' THEN total_amount END), 0) as total_revenue,
      COALESCE(AVG(CASE WHEN status = 'delivered' THEN total_amount END), 0) as avg_order_value,
      COALESCE(AVG(
        CASE 
          WHEN status = 'delivered' AND actual_delivery_time IS NOT NULL 
          THEN EXTRACT(EPOCH FROM (actual_delivery_time - created_at))/60 
        END
      ), 0) as avg_delivery_time_minutes
    FROM orders 
    WHERE restaurant_id = $1 
      AND created_at >= $2 
      AND created_at <= $3;
  `,

  // Get customer order statistics
  getCustomerOrderStats: `
    SELECT 
      COUNT(*) as total_orders,
      COUNT(CASE WHEN status = 'delivered' THEN 1 END) as completed_orders,
      COALESCE(SUM(CASE WHEN status = 'delivered' THEN total_amount END), 0) as total_spent,
      COALESCE(AVG(CASE WHEN status = 'delivered' THEN total_amount END), 0) as avg_order_value,
      COUNT(DISTINCT restaurant_id) as unique_restaurants
    FROM orders 
    WHERE customer_id = $1 
      AND created_at >= $2;
  `,

  // Get recent orders (for dashboard)
  getRecentOrders: `
    SELECT 
      o.*,
      r.name as restaurant_name,
      u.first_name || ' ' || u.last_name as customer_name
    FROM orders o
    JOIN restaurants r ON o.restaurant_id = r.id
    JOIN users u ON o.customer_id = u.id
    ORDER BY o.created_at DESC
    LIMIT $1;
  `,

  // Generate order number
  generateOrderNumber: `
    SELECT 'ORD' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(NEXTVAL('order_number_seq')::TEXT, 6, '0') as order_number;
  `,

  // Get peak hours analysis
  getPeakHoursAnalysis: `
    SELECT 
      EXTRACT(HOUR FROM created_at) as hour_of_day,
      COUNT(*) as order_count,
      COALESCE(AVG(total_amount), 0) as avg_order_value
    FROM orders 
    WHERE restaurant_id = $1 
      AND created_at >= $2 
      AND created_at <= $3
      AND status != 'cancelled'
    GROUP BY EXTRACT(HOUR FROM created_at)
    ORDER BY hour_of_day;
  `,

  // Get popular items by orders
  getPopularItemsByOrders: `
    SELECT 
      fi.id,
      fi.name,
      fi.price,
      fi.image_url,
      COUNT(oi.id) as order_count,
      SUM(oi.quantity) as total_quantity,
      COALESCE(SUM(oi.total_price), 0) as total_revenue
    FROM food_items fi
    JOIN order_items oi ON fi.id = oi.food_item_id
    JOIN orders o ON oi.order_id = o.id
    WHERE o.restaurant_id = $1 
      AND o.created_at >= $2 
      AND o.status != 'cancelled'
    GROUP BY fi.id, fi.name, fi.price, fi.image_url
    ORDER BY order_count DESC, total_quantity DESC
    LIMIT $3;
  `
};