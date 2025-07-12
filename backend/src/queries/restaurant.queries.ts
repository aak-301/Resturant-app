// Restaurant-related SQL queries

export const restaurantQueries = {
  // Get all restaurants with their menu items
  getAllRestaurantsWithMenu: `
    SELECT 
      r.*,
      COALESCE(
        json_agg(
          json_build_object(
            'id', fi.id,
            'name', fi.name,
            'description', fi.description,
            'price', fi.price,
            'image_url', fi.image_url,
            'category', fc.name,
            'is_featured', fi.is_featured,
            'average_rating', fi.average_rating,
            'total_orders', fi.total_orders
          )
        ) FILTER (WHERE fi.id IS NOT NULL), 
        '[]'
      ) as menu_items
    FROM restaurants r
    LEFT JOIN food_items fi ON r.id = fi.restaurant_id AND fi.is_available = true
    LEFT JOIN food_categories fc ON fi.category_id = fc.id
    WHERE r.is_active = true
    GROUP BY r.id
    ORDER BY r.average_rating DESC, r.total_reviews DESC;
  `,

  // Get restaurant by ID
  getRestaurantById: `
    SELECT 
      r.*,
      rc.name as chain_name,
      rc.logo_url as chain_logo
    FROM restaurants r
    LEFT JOIN restaurant_chains rc ON r.chain_id = rc.id
    WHERE r.id = $1 AND r.is_active = true;
  `,

  // Get restaurants by city
  getRestaurantsByCity: `
    SELECT 
      r.*,
      COUNT(fi.id) as total_menu_items
    FROM restaurants r
    LEFT JOIN food_items fi ON r.id = fi.restaurant_id AND fi.is_available = true
    WHERE r.city ILIKE $1 AND r.is_active = true
    GROUP BY r.id
    ORDER BY r.average_rating DESC;
  `,

  // Get restaurants by cuisine type
  getRestaurantsByCuisine: `
    SELECT 
      r.*,
      COUNT(fi.id) as total_menu_items
    FROM restaurants r
    LEFT JOIN food_items fi ON r.id = fi.restaurant_id AND fi.is_available = true
    WHERE $1 = ANY(r.cuisine_type) AND r.is_active = true
    GROUP BY r.id
    ORDER BY r.average_rating DESC;
  `,

  // Search restaurants
  searchRestaurants: `
    SELECT 
      r.*,
      COUNT(fi.id) as total_menu_items,
      ts_rank_cd(
        to_tsvector('english', r.name || ' ' || r.description || ' ' || array_to_string(r.cuisine_type, ' ')),
        plainto_tsquery('english', $1)
      ) as relevance_score
    FROM restaurants r
    LEFT JOIN food_items fi ON r.id = fi.restaurant_id AND fi.is_available = true
    WHERE r.is_active = true
      AND (
        r.name ILIKE $2 
        OR r.description ILIKE $2 
        OR array_to_string(r.cuisine_type, ' ') ILIKE $2
      )
    GROUP BY r.id
    ORDER BY relevance_score DESC, r.average_rating DESC;
  `,

  // Get nearby restaurants (requires latitude and longitude)
  getNearbyRestaurants: `
    SELECT 
      r.*,
      COUNT(fi.id) as total_menu_items,
      (
        6371 * acos(
          cos(radians($1)) * cos(radians(r.latitude)) * 
          cos(radians(r.longitude) - radians($2)) + 
          sin(radians($1)) * sin(radians(r.latitude))
        )
      ) AS distance_km
    FROM restaurants r
    LEFT JOIN food_items fi ON r.id = fi.restaurant_id AND fi.is_available = true
    WHERE r.is_active = true 
      AND r.latitude IS NOT NULL 
      AND r.longitude IS NOT NULL
    GROUP BY r.id
    HAVING distance_km <= $3
    ORDER BY distance_km ASC, r.average_rating DESC;
  `,

  // Get top-rated restaurants
  getTopRatedRestaurants: `
    SELECT 
      r.*,
      COUNT(fi.id) as total_menu_items
    FROM restaurants r
    LEFT JOIN food_items fi ON r.id = fi.restaurant_id AND fi.is_available = true
    WHERE r.is_active = true 
      AND r.average_rating >= 4.0 
      AND r.total_reviews >= 10
    GROUP BY r.id
    ORDER BY r.average_rating DESC, r.total_reviews DESC
    LIMIT $1;
  `,

  // Get restaurant statistics
  getRestaurantStats: `
    SELECT 
      r.id,
      r.name,
      COUNT(DISTINCT fi.id) as total_menu_items,
      COUNT(DISTINCT o.id) as total_orders,
      COALESCE(SUM(o.total_amount), 0) as total_revenue,
      COALESCE(AVG(rr.rating), 0) as average_rating,
      COUNT(DISTINCT rr.id) as total_reviews
    FROM restaurants r
    LEFT JOIN food_items fi ON r.id = fi.restaurant_id
    LEFT JOIN orders o ON r.id = o.restaurant_id
    LEFT JOIN restaurant_reviews rr ON r.id = rr.restaurant_id
    WHERE r.id = $1
    GROUP BY r.id, r.name;
  `
};