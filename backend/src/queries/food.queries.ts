// Food items and menu-related SQL queries

export const foodQueries = {
  // Get restaurant menu with categories and variants
  getRestaurantMenu: `
    SELECT 
      fi.*,
      fc.name as category_name,
      fc.sort_order as category_sort_order,
      COALESCE(
        json_agg(
          json_build_object(
            'id', fiv.id,
            'name', fiv.name,
            'type', fiv.type,
            'price_modifier', fiv.price_modifier,
            'is_default', fiv.is_default
          )
        ) FILTER (WHERE fiv.id IS NOT NULL), 
        '[]'
      ) as variants
    FROM food_items fi
    JOIN food_categories fc ON fi.category_id = fc.id
    LEFT JOIN food_item_variants fiv ON fi.id = fiv.food_item_id
    WHERE fi.restaurant_id = $1 AND fi.is_available = true
    GROUP BY fi.id, fc.name, fc.sort_order
    ORDER BY fc.sort_order, fi.name;
  `,

  // Get food item by ID with variants
  getFoodItemById: `
    SELECT 
      fi.*,
      fc.name as category_name,
      r.name as restaurant_name,
      r.delivery_fee,
      r.minimum_order_amount,
      COALESCE(
        json_agg(
          json_build_object(
            'id', fiv.id,
            'name', fiv.name,
            'type', fiv.type,
            'price_modifier', fiv.price_modifier,
            'is_default', fiv.is_default
          )
        ) FILTER (WHERE fiv.id IS NOT NULL), 
        '[]'
      ) as variants
    FROM food_items fi
    JOIN food_categories fc ON fi.category_id = fc.id
    JOIN restaurants r ON fi.restaurant_id = r.id
    LEFT JOIN food_item_variants fiv ON fi.id = fiv.food_item_id
    WHERE fi.id = $1
    GROUP BY fi.id, fc.name, r.name, r.delivery_fee, r.minimum_order_amount;
  `,

  // Search food items with filters
  searchFoodItems: `
    SELECT 
      fi.*,
      fc.name as category_name,
      r.name as restaurant_name,
      r.delivery_fee,
      r.minimum_order_amount,
      r.average_rating as restaurant_rating,
      ts_rank_cd(
        to_tsvector('english', fi.name || ' ' || COALESCE(fi.description, '') || ' ' || array_to_string(fi.ingredients, ' ')),
        plainto_tsquery('english', $1)
      ) as relevance_score
    FROM food_items fi
    JOIN food_categories fc ON fi.category_id = fc.id
    JOIN restaurants r ON fi.restaurant_id = r.id
    WHERE fi.is_available = true 
      AND r.is_active = true
      AND (
        fi.name ILIKE $2 
        OR fi.description ILIKE $2 
        OR array_to_string(fi.ingredients, ' ') ILIKE $2
      )
    ORDER BY relevance_score DESC, fi.average_rating DESC, fi.total_orders DESC;
  `,

  // Get food items by category
  getFoodItemsByCategory: `
    SELECT 
      fi.*,
      fc.name as category_name,
      r.name as restaurant_name,
      r.delivery_fee,
      r.minimum_order_amount
    FROM food_items fi
    JOIN food_categories fc ON fi.category_id = fc.id
    JOIN restaurants r ON fi.restaurant_id = r.id
    WHERE fc.id = $1 
      AND fi.is_available = true 
      AND r.is_active = true
    ORDER BY fi.average_rating DESC, fi.total_orders DESC;
  `,

  // Get featured/popular food items
  getFeaturedFoodItems: `
    SELECT 
      fi.*,
      fc.name as category_name,
      r.name as restaurant_name,
      r.delivery_fee,
      r.minimum_order_amount,
      r.average_rating as restaurant_rating
    FROM food_items fi
    JOIN food_categories fc ON fi.category_id = fc.id
    JOIN restaurants r ON fi.restaurant_id = r.id
    WHERE fi.is_available = true 
      AND r.is_active = true 
      AND (fi.is_featured = true OR fi.total_orders > 50)
    ORDER BY fi.is_featured DESC, fi.average_rating DESC, fi.total_orders DESC
    LIMIT $1;
  `,

  // Get trending food items (most ordered recently)
  getTrendingFoodItems: `
    SELECT 
      fi.*,
      fc.name as category_name,
      r.name as restaurant_name,
      r.delivery_fee,
      r.minimum_order_amount,
      COUNT(oi.id) as recent_orders
    FROM food_items fi
    JOIN food_categories fc ON fi.category_id = fc.id
    JOIN restaurants r ON fi.restaurant_id = r.id
    LEFT JOIN order_items oi ON fi.id = oi.food_item_id
    LEFT JOIN orders o ON oi.order_id = o.id
    WHERE fi.is_available = true 
      AND r.is_active = true
      AND o.created_at >= NOW() - INTERVAL '7 days'
    GROUP BY fi.id, fc.name, r.name, r.delivery_fee, r.minimum_order_amount
    HAVING COUNT(oi.id) > 0
    ORDER BY recent_orders DESC, fi.average_rating DESC
    LIMIT $1;
  `,

  // Get food items by dietary preferences
  getFoodItemsByDiet: `
    SELECT 
      fi.*,
      fc.name as category_name,
      r.name as restaurant_name,
      r.delivery_fee,
      r.minimum_order_amount
    FROM food_items fi
    JOIN food_categories fc ON fi.category_id = fc.id
    JOIN restaurants r ON fi.restaurant_id = r.id
    WHERE fi.is_available = true 
      AND r.is_active = true
      AND $1 = ANY(fi.dietary_info)
    ORDER BY fi.average_rating DESC, fi.total_orders DESC;
  `,

  // Get food items with price range filter
  getFoodItemsByPriceRange: `
    SELECT 
      fi.*,
      fc.name as category_name,
      r.name as restaurant_name,
      r.delivery_fee,
      r.minimum_order_amount
    FROM food_items fi
    JOIN food_categories fc ON fi.category_id = fc.id
    JOIN restaurants r ON fi.restaurant_id = r.id
    WHERE fi.is_available = true 
      AND r.is_active = true
      AND fi.price BETWEEN $1 AND $2
    ORDER BY fi.price ASC, fi.average_rating DESC;
  `,

  // Get food item reviews
  getFoodItemReviews: `
    SELECT 
      fir.*,
      u.first_name,
      u.last_name,
      CASE 
        WHEN fir.is_anonymous = true THEN 'Anonymous'
        ELSE CONCAT(u.first_name, ' ', SUBSTRING(u.last_name, 1, 1), '.')
      END as reviewer_name
    FROM food_item_reviews fir
    JOIN users u ON fir.user_id = u.id
    WHERE fir.food_item_id = $1
    ORDER BY fir.created_at DESC
    LIMIT $2 OFFSET $3;
  `,

  // Get food item statistics
  getFoodItemStats: `
    SELECT 
      fi.id,
      fi.name,
      COUNT(DISTINCT oi.id) as total_orders,
      SUM(oi.quantity) as total_quantity_sold,
      COALESCE(SUM(oi.total_price), 0) as total_revenue,
      COALESCE(AVG(fir.rating), 0) as average_rating,
      COUNT(DISTINCT fir.id) as total_reviews,
      fi.prep_time_minutes,
      fi.calories
    FROM food_items fi
    LEFT JOIN order_items oi ON fi.id = oi.food_item_id
    LEFT JOIN food_item_reviews fir ON fi.id = fir.food_item_id
    WHERE fi.id = $1
    GROUP BY fi.id, fi.name, fi.prep_time_minutes, fi.calories;
  `
};