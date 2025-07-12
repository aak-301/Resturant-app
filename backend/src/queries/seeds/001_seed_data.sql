-- Seed data for Restaurant Multi-Platform App
-- This file contains initial data for development and testing

-- Insert food categories
INSERT INTO food_categories (id, name, description, image_url, sort_order) VALUES
(uuid_generate_v4(), 'Appetizers', 'Delicious starters to begin your meal', 'https://example.com/images/appetizers.jpg', 1),
(uuid_generate_v4(), 'Main Course', 'Hearty main dishes that satisfy', 'https://example.com/images/main-course.jpg', 2),
(uuid_generate_v4(), 'Desserts', 'Sweet treats to end your meal', 'https://example.com/images/desserts.jpg', 3),
(uuid_generate_v4(), 'Beverages', 'Refreshing drinks and beverages', 'https://example.com/images/beverages.jpg', 4),
(uuid_generate_v4(), 'Pizza', 'Authentic Italian pizzas', 'https://example.com/images/pizza.jpg', 5),
(uuid_generate_v4(), 'Burgers', 'Juicy burgers and sandwiches', 'https://example.com/images/burgers.jpg', 6),
(uuid_generate_v4(), 'Indian', 'Traditional Indian cuisine', 'https://example.com/images/indian.jpg', 7),
(uuid_generate_v4(), 'Chinese', 'Authentic Chinese dishes', 'https://example.com/images/chinese.jpg', 8),
(uuid_generate_v4(), 'Salads', 'Fresh and healthy salads', 'https://example.com/images/salads.jpg', 9),
(uuid_generate_v4(), 'Pasta', 'Italian pasta dishes', 'https://example.com/images/pasta.jpg', 10);

-- Insert sample users (customers and restaurant owners)
INSERT INTO users (id, email, password_hash, first_name, last_name, phone, role, status, email_verified) VALUES
-- Super Admin
(uuid_generate_v4(), 'admin@restaurant.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeELdCEKJeYRSsGW2', 'Super', 'Admin', '+91-9876543210', 'super_admin', 'active', true),

-- Restaurant Chain Owner
(uuid_generate_v4(), 'owner@pizzapalace.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeELdCEKJeYRSsGW2', 'John', 'Doe', '+91-9876543211', 'chain_owner', 'active', true),

-- Location Admins
(uuid_generate_v4(), 'manager@pizzapalace.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeELdCEKJeYRSsGW2', 'Jane', 'Smith', '+91-9876543212', 'location_admin', 'active', true),

-- Customers
(uuid_generate_v4(), 'customer1@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeELdCEKJeYRSsGW2', 'Alice', 'Johnson', '+91-9876543213', 'customer', 'active', true),
(uuid_generate_v4(), 'customer2@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeELdCEKJeYRSsGW2', 'Bob', 'Wilson', '+91-9876543214', 'customer', 'active', true),

-- Delivery Person
(uuid_generate_v4(), 'delivery@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeELdCEKJeYRSsGW2', 'Mike', 'Davis', '+91-9876543215', 'delivery_person', 'active', true);

-- Insert restaurant chains
INSERT INTO restaurant_chains (id, name, description, logo_url, owner_id) VALUES
(uuid_generate_v4(), 'Pizza Palace', 'Authentic Italian pizzas and more', 'https://example.com/logos/pizza-palace.png', 
 (SELECT id FROM users WHERE email = 'owner@pizzapalace.com')),

(uuid_generate_v4(), 'Spice Garden', 'Traditional Indian cuisine with modern twist', 'https://example.com/logos/spice-garden.png',
 (SELECT id FROM users WHERE email = 'owner@pizzapalace.com'));

-- Insert restaurants
INSERT INTO restaurants (id, chain_id, name, description, cuisine_type, phone, email, street_address, city, state, postal_code, latitude, longitude, business_hours, delivery_radius_km, minimum_order_amount, delivery_fee) VALUES
-- Pizza Palace locations
(uuid_generate_v4(), 
 (SELECT id FROM restaurant_chains WHERE name = 'Pizza Palace'),
 'Pizza Palace - Connaught Place', 
 'Authentic Italian pizzas in the heart of Delhi', 
 ARRAY['Italian', 'Pizza', 'Fast Food'],
 '+91-11-12345678',
 'cp@pizzapalace.com',
 'Shop 15, Connaught Place, Central Delhi',
 'Delhi',
 'Delhi',
 '110001',
 28.6315,
 77.2167,
 '{"monday": "10:00-23:00", "tuesday": "10:00-23:00", "wednesday": "10:00-23:00", "thursday": "10:00-23:00", "friday": "10:00-00:00", "saturday": "10:00-00:00", "sunday": "10:00-23:00"}',
 15.0,
 299.00,
 49.00),

(uuid_generate_v4(), 
 (SELECT id FROM restaurant_chains WHERE name = 'Pizza Palace'),
 'Pizza Palace - Karol Bagh', 
 'Delicious pizzas and Italian cuisine', 
 ARRAY['Italian', 'Pizza', 'Fast Food'],
 '+91-11-23456789',
 'kb@pizzapalace.com',
 '25, Ajmal Khan Road, Karol Bagh',
 'Delhi',
 'Delhi',
 '110005',
 28.6519,
 77.1909,
 '{"monday": "11:00-23:00", "tuesday": "11:00-23:00", "wednesday": "11:00-23:00", "thursday": "11:00-23:00", "friday": "11:00-00:00", "saturday": "11:00-00:00", "sunday": "11:00-23:00"}',
 12.0,
 199.00,
 39.00),

-- Spice Garden locations
(uuid_generate_v4(), 
 (SELECT id FROM restaurant_chains WHERE name = 'Spice Garden'),
 'Spice Garden - Lajpat Nagar', 
 'Authentic Indian cuisine with traditional flavors', 
 ARRAY['Indian', 'North Indian', 'South Indian', 'Vegetarian'],
 '+91-11-34567890',
 'ln@spicegarden.com',
 '12, Central Market, Lajpat Nagar IV',
 'Delhi',
 'Delhi',
 '110024',
 28.5653,
 77.2430,
 '{"monday": "12:00-23:30", "tuesday": "12:00-23:30", "wednesday": "12:00-23:30", "thursday": "12:00-23:30", "friday": "12:00-00:00", "saturday": "12:00-00:00", "sunday": "12:00-23:30"}',
 20.0,
 249.00,
 29.00),

-- Independent restaurant
(uuid_generate_v4(), 
 NULL,
 'Burger Junction', 
 'Gourmet burgers and quick bites', 
 ARRAY['American', 'Fast Food', 'Burgers'],
 '+91-11-45678901',
 'info@burgerjunction.com',
 '45, Khan Market, New Delhi',
 'Delhi',
 'Delhi',
 '110003',
 28.5984,
 77.2319,
 '{"monday": "11:00-22:00", "tuesday": "11:00-22:00", "wednesday": "11:00-22:00", "thursday": "11:00-22:00", "friday": "11:00-23:00", "saturday": "11:00-23:00", "sunday": "11:00-22:00"}',
 10.0,
 149.00,
 25.00);

-- Insert food items for Pizza Palace - Connaught Place
INSERT INTO food_items (id, restaurant_id, category_id, name, description, price, ingredients, allergens, dietary_info, calories, prep_time_minutes, image_url, is_available, is_featured) VALUES
-- Pizzas
(uuid_generate_v4(),
 (SELECT id FROM restaurants WHERE name = 'Pizza Palace - Connaught Place'),
 (SELECT id FROM food_categories WHERE name = 'Pizza'),
 'Margherita Pizza',
 'Classic Italian pizza with fresh tomatoes, mozzarella, and basil',
 399.00,
 ARRAY['Pizza dough', 'Tomato sauce', 'Mozzarella cheese', 'Fresh basil', 'Olive oil'],
 ARRAY['Gluten', 'Dairy'],
 ARRAY['Vegetarian'],
 320,
 15,
 'https://example.com/food/margherita-pizza.jpg',
 true,
 true),

(uuid_generate_v4(),
 (SELECT id FROM restaurants WHERE name = 'Pizza Palace - Connaught Place'),
 (SELECT id FROM food_categories WHERE name = 'Pizza'),
 'Pepperoni Pizza',
 'Delicious pizza topped with spicy pepperoni and mozzarella cheese',
 499.00,
 ARRAY['Pizza dough', 'Tomato sauce', 'Mozzarella cheese', 'Pepperoni', 'Oregano'],
 ARRAY['Gluten', 'Dairy'],
 ARRAY[],
 450,
 18,
 'https://example.com/food/pepperoni-pizza.jpg',
 true,
 false),

(uuid_generate_v4(),
 (SELECT id FROM restaurants WHERE name = 'Pizza Palace - Connaught Place'),
 (SELECT id FROM food_categories WHERE name = 'Pizza'),
 'Veggie Supreme',
 'Loaded with fresh vegetables - bell peppers, onions, mushrooms, olives',
 549.00,
 ARRAY['Pizza dough', 'Tomato sauce', 'Mozzarella cheese', 'Bell peppers', 'Onions', 'Mushrooms', 'Black olives', 'Corn'],
 ARRAY['Gluten', 'Dairy'],
 ARRAY['Vegetarian'],
 380,
 20,
 'https://example.com/food/veggie-supreme.jpg',
 true,
 true),

-- Appetizers
(uuid_generate_v4(),
 (SELECT id FROM restaurants WHERE name = 'Pizza Palace - Connaught Place'),
 (SELECT id FROM food_categories WHERE name = 'Appetizers'),
 'Garlic Bread',
 'Crispy bread with garlic butter and herbs',
 149.00,
 ARRAY['Bread', 'Garlic', 'Butter', 'Herbs', 'Parmesan cheese'],
 ARRAY['Gluten', 'Dairy'],
 ARRAY['Vegetarian'],
 180,
 8,
 'https://example.com/food/garlic-bread.jpg',
 true,
 false),

(uuid_generate_v4(),
 (SELECT id FROM restaurants WHERE name = 'Pizza Palace - Connaught Place'),
 (SELECT id FROM food_categories WHERE name = 'Appetizers'),
 'Chicken Wings',
 'Spicy buffalo chicken wings with ranch dip',
 299.00,
 ARRAY['Chicken wings', 'Buffalo sauce', 'Ranch dressing', 'Celery salt'],
 ARRAY['Dairy'],
 ARRAY[],
 280,
 12,
 'https://example.com/food/chicken-wings.jpg',
 true,
 false),

-- Beverages
(uuid_generate_v4(),
 (SELECT id FROM restaurants WHERE name = 'Pizza Palace - Connaught Place'),
 (SELECT id FROM food_categories WHERE name = 'Beverages'),
 'Coca Cola',
 'Chilled Coca Cola 330ml',
 49.00,
 ARRAY['Carbonated water', 'Sugar', 'Cola flavor'],
 ARRAY[],
 ARRAY['Vegan'],
 140,
 2,
 'https://example.com/food/coca-cola.jpg',
 true,
 false),

-- Insert food items for Spice Garden - Lajpat Nagar
(uuid_generate_v4(),
 (SELECT id FROM restaurants WHERE name = 'Spice Garden - Lajpat Nagar'),
 (SELECT id FROM food_categories WHERE name = 'Indian'),
 'Butter Chicken',
 'Creamy tomato-based curry with tender chicken pieces',
 349.00,
 ARRAY['Chicken', 'Tomatoes', 'Cream', 'Butter', 'Garam masala', 'Ginger-garlic paste'],
 ARRAY['Dairy'],
 ARRAY[],
 420,
 25,
 'https://example.com/food/butter-chicken.jpg',
 true,
 true),

(uuid_generate_v4(),
 (SELECT id FROM restaurants WHERE name = 'Spice Garden - Lajpat Nagar'),
 (SELECT id FROM food_categories WHERE name = 'Indian'),
 'Dal Makhani',
 'Rich and creamy black lentil curry',
 249.00,
 ARRAY['Black lentils', 'Kidney beans', 'Cream', 'Butter', 'Tomatoes', 'Spices'],
 ARRAY['Dairy'],
 ARRAY['Vegetarian'],
 320,
 30,
 'https://example.com/food/dal-makhani.jpg',
 true,
 true),

(uuid_generate_v4(),
 (SELECT id FROM restaurants WHERE name = 'Spice Garden - Lajpat Nagar'),
 (SELECT id FROM food_categories WHERE name = 'Indian'),
 'Paneer Tikka Masala',
 'Grilled cottage cheese in spicy tomato gravy',
 299.00,
 ARRAY['Paneer', 'Tomatoes', 'Onions', 'Bell peppers', 'Spices', 'Cream'],
 ARRAY['Dairy'],
 ARRAY['Vegetarian'],
 380,
 20,
 'https://example.com/food/paneer-tikka-masala.jpg',
 true,
 false),

(uuid_generate_v4(),
 (SELECT id FROM restaurants WHERE name = 'Spice Garden - Lajpat Nagar'),
 (SELECT id FROM food_categories WHERE name = 'Indian'),
 'Biryani - Chicken',
 'Aromatic basmati rice cooked with tender chicken and spices',
 399.00,
 ARRAY['Basmati rice', 'Chicken', 'Yogurt', 'Onions', 'Saffron', 'Biryani masala'],
 ARRAY['Dairy'],
 ARRAY[],
 520,
 45,
 'https://example.com/food/chicken-biryani.jpg',
 true,
 true),

-- Insert food items for Burger Junction
(uuid_generate_v4(),
 (SELECT id FROM restaurants WHERE name = 'Burger Junction'),
 (SELECT id FROM food_categories WHERE name = 'Burgers'),
 'Classic Beef Burger',
 'Juicy beef patty with lettuce, tomato, onion, and special sauce',
 299.00,
 ARRAY['Beef patty', 'Burger bun', 'Lettuce', 'Tomato', 'Onion', 'Cheese', 'Special sauce'],
 ARRAY['Gluten', 'Dairy'],
 ARRAY[],
 480,
 12,
 'https://example.com/food/beef-burger.jpg',
 true,
 true),

(uuid_generate_v4(),
 (SELECT id FROM restaurants WHERE name = 'Burger Junction'),
 (SELECT id FROM food_categories WHERE name = 'Burgers'),
 'Veggie Burger',
 'Plant-based patty with fresh vegetables and vegan mayo',
 249.00,
 ARRAY['Veggie patty', 'Burger bun', 'Lettuce', 'Tomato', 'Onion', 'Vegan mayo'],
 ARRAY['Gluten'],
 ARRAY['Vegetarian', 'Vegan'],
 320,
 10,
 'https://example.com/food/veggie-burger.jpg',
 true,
 false),

(uuid_generate_v4(),
 (SELECT id FROM restaurants WHERE name = 'Burger Junction'),
 (SELECT id FROM food_categories WHERE name = 'Appetizers'),
 'French Fries',
 'Crispy golden french fries with sea salt',
 99.00,
 ARRAY['Potatoes', 'Vegetable oil', 'Sea salt'],
 ARRAY[],
 ARRAY['Vegetarian', 'Vegan'],
 240,
 8,
 'https://example.com/food/french-fries.jpg',
 true,
 false);

-- Insert food item variants (sizes for pizzas)
INSERT INTO food_item_variants (id, food_item_id, name, type, price_modifier, is_default) VALUES
-- Margherita Pizza variants
(uuid_generate_v4(), 
 (SELECT id FROM food_items WHERE name = 'Margherita Pizza'),
 'Regular (10 inch)', 'size', 0.00, true),
(uuid_generate_v4(), 
 (SELECT id FROM food_items WHERE name = 'Margherita Pizza'),
 'Medium (12 inch)', 'size', 100.00, false),
(uuid_generate_v4(), 
 (SELECT id FROM food_items WHERE name = 'Margherita Pizza'),
 'Large (14 inch)', 'size', 200.00, false),

-- Pepperoni Pizza variants
(uuid_generate_v4(), 
 (SELECT id FROM food_items WHERE name = 'Pepperoni Pizza'),
 'Regular (10 inch)', 'size', 0.00, true),
(uuid_generate_v4(), 
 (SELECT id FROM food_items WHERE name = 'Pepperoni Pizza'),
 'Medium (12 inch)', 'size', 100.00, false),
(uuid_generate_v4(), 
 (SELECT id FROM food_items WHERE name = 'Pepperoni Pizza'),
 'Large (14 inch)', 'size', 200.00, false);

-- Insert sample customer addresses
INSERT INTO user_addresses (id, user_id, label, street_address, city, state, postal_code, latitude, longitude, is_default) VALUES
(uuid_generate_v4(),
 (SELECT id FROM users WHERE email = 'customer1@example.com'),
 'Home',
 'A-123, Lajpat Nagar II',
 'Delhi',
 'Delhi',
 '110024',
 28.5653,
 77.2430,
 true),

(uuid_generate_v4(),
 (SELECT id FROM users WHERE email = 'customer1@example.com'),
 'Work',
 'Office Complex, Connaught Place',
 'Delhi',
 'Delhi',
 '110001',
 28.6315,
 77.2167,
 false),

(uuid_generate_v4(),
 (SELECT id FROM users WHERE email = 'customer2@example.com'),
 'Home',
 'B-456, Karol Bagh',
 'Delhi',
 'Delhi',
 '110005',
 28.6519,
 77.1909,
 true);

-- Update restaurant ratings (sample data)
UPDATE restaurants SET 
  average_rating = 4.5,
  total_reviews = 127
WHERE name = 'Pizza Palace - Connaught Place';

UPDATE restaurants SET 
  average_rating = 4.2,
  total_reviews = 89
WHERE name = 'Pizza Palace - Karol Bagh';

UPDATE restaurants SET 
  average_rating = 4.7,
  total_reviews = 203
WHERE name = 'Spice Garden - Lajpat Nagar';

UPDATE restaurants SET 
  average_rating = 4.1,
  total_reviews = 67
WHERE name = 'Burger Junction';

-- Update food item ratings (sample data)
UPDATE food_items SET 
  average_rating = 4.6,
  total_reviews = 45,
  total_orders = 156
WHERE name = 'Margherita Pizza';

UPDATE food_items SET 
  average_rating = 4.8,
  total_reviews = 67,
  total_orders = 203
WHERE name = 'Butter Chicken';

UPDATE food_items SET 
  average_rating = 4.4,
  total_reviews = 23,
  total_orders = 89
WHERE name = 'Classic Beef Burger';