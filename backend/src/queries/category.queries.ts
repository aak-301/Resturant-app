// Food categories related SQL queries

export const categoryQueries = {
  // Get all active food categories
  getAllCategories: `
    SELECT 
      fc.*,
      COUNT(fi.id) as total_items,
      COUNT(CASE WHEN fi.is_available = true THEN 1 END) as available_items
    FROM food_categories fc
    LEFT JOIN food_items fi ON fc.id = fi.category_id
    WHERE fc.is_active = true
    GROUP BY fc.id
    ORDER BY fc.sort_order, fc.name;
  `,

  // Get category by ID
  getCategoryById: `
    SELECT 
      fc.*,
      COUNT(fi.id) as total_items,
      COUNT(CASE WHEN fi.is_available = true THEN 1 END) as available_items
    FROM food_categories fc
    LEFT JOIN food_items fi ON fc.id = fi.category_id
    WHERE fc.id = $1 AND fc.is_active = true
    GROUP BY fc.id;
  `,

  // Get categories with item count for a specific restaurant
  getCategoriesForRestaurant: `
    SELECT 
      fc.*,
      COUNT(fi.id) as total_items,
      COUNT(CASE WHEN fi.is_available = true THEN 1 END) as available_items,
      MIN(fi.price) as min_price,
      MAX(fi.price) as max_price,
      ROUND(AVG(fi.price), 2) as avg_price
    FROM food_categories fc
    INNER JOIN food_items fi ON fc.id = fi.category_id
    WHERE fi.restaurant_id = $1 
      AND fc.is_active = true
    GROUP BY fc.id
    HAVING COUNT(CASE WHEN fi.is_available = true THEN 1 END) > 0
    ORDER BY fc.sort_order, fc.name;
  `,

  // Get popular categories (based on order frequency)
  getPopularCategories: `
    SELECT 
      fc.*,
      COUNT(DISTINCT oi.id) as total_orders,
      SUM(oi.quantity) as total_quantity_sold,
      COUNT(DISTINCT fi.id) as unique_items_ordered
    FROM food_categories fc
    JOIN food_items fi ON fc.id = fi.category_id
    JOIN order_items oi ON fi.id = oi.food_item_id
    JOIN orders o ON oi.order_id = o.id
    WHERE fc.is_active = true 
      AND o.created_at >= NOW() - INTERVAL '30 days'
    GROUP BY fc.id
    ORDER BY total_orders DESC, total_quantity_sold DESC
    LIMIT $1;
  `,

  // Search categories
  searchCategories: `
    SELECT 
      fc.*,
      COUNT(fi.id) as total_items,
      ts_rank_cd(
        to_tsvector('english', fc.name || ' ' || COALESCE(fc.description, '')),
        plainto_tsquery('english', $1)
      ) as relevance_score
    FROM food_categories fc
    LEFT JOIN food_items fi ON fc.id = fi.category_id AND fi.is_available = true
    WHERE fc.is_active = true
      AND (
        fc.name ILIKE $2 
        OR fc.description ILIKE $2
      )
    GROUP BY fc.id
    ORDER BY relevance_score DESC, fc.sort_order;
  `,

  // Get category statistics
  getCategoryStats: `
    SELECT 
      fc.id,
      fc.name,
      COUNT(DISTINCT fi.id) as total_food_items,
      COUNT(DISTINCT r.id) as restaurants_offering,
      COUNT(DISTINCT oi.id) as total_orders,
      COALESCE(SUM(oi.total_price), 0) as total_revenue,
      ROUND(AVG(fi.price), 2) as avg_item_price,
      MIN(fi.price) as min_price,
      MAX(fi.price) as max_price
    FROM food_categories fc
    LEFT JOIN food_items fi ON fc.id = fi.category_id
    LEFT JOIN restaurants r ON fi.restaurant_id = r.id
    LEFT JOIN order_items oi ON fi.id = oi.food_item_id
    WHERE fc.id = $1
    GROUP BY fc.id, fc.name;
  `,

  // Get categories with trending items
  getCategoriesWithTrendingItems: `
    SELECT 
      fc.*,
      json_agg(
        json_build_object(
          'id', fi.id,
          'name', fi.name,
          'price', fi.price,
          'image_url', fi.image_url,
          'restaurant_name', r.name,
          'recent_orders', recent_order_counts.order_count
        ) ORDER BY recent_order_counts.order_count DESC
      ) FILTER (WHERE fi.id IS NOT NULL) as trending_items
    FROM food_categories fc
    LEFT JOIN food_items fi ON fc.id = fi.category_id
    LEFT JOIN restaurants r ON fi.restaurant_id = r.id
    LEFT JOIN (
      SELECT 
        oi.food_item_id,
        COUNT(*) as order_count
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.created_at >= NOW() - INTERVAL '7 days'
      GROUP BY oi.food_item_id
    ) recent_order_counts ON fi.id = recent_order_counts.food_item_id
    WHERE fc.is_active = true 
      AND fi.is_available = true
      AND recent_order_counts.order_count > 0
    GROUP BY fc.id
    ORDER BY fc.sort_order;
  `
};