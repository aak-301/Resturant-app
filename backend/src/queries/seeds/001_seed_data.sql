-- 001_seed_data.sql
-- Updated seed data for the new restaurant schema

-- Insert sample users (admin and customers)
INSERT INTO users (id, email, password_hash, first_name, last_name, phone, role, status, email_verified) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'admin@restaurant.com', '$2b$10$hash1', 'Admin', 'User', '+91-9876543210', 'super_admin', 'active', true),
('550e8400-e29b-41d4-a716-446655440002', 'owner@gardenbistro.com', '$2b$10$hash2', 'John', 'Smith', '+91-9876543211', 'chain_owner', 'active', true),
('550e8400-e29b-41d4-a716-446655440003', 'customer1@email.com', '$2b$10$hash3', 'Sarah', 'Johnson', '+91-9876543212', 'customer', 'active', true),
('550e8400-e29b-41d4-a716-446655440004', 'customer2@email.com', '$2b$10$hash4', 'Mike', 'Chen', '+91-9876543213', 'customer', 'active', true),
('550e8400-e29b-41d4-a716-446655440005', 'delivery1@email.com', '$2b$10$hash5', 'Raj', 'Kumar', '+91-9876543214', 'delivery_person', 'active', true)
ON CONFLICT (email) DO NOTHING;

-- Insert user profiles
INSERT INTO user_profiles (user_id, dietary_preferences, allergies, preferred_language) VALUES
('550e8400-e29b-41d4-a716-446655440003', '{"vegetarian"}', '{"nuts"}', 'en'),
('550e8400-e29b-41d4-a716-446655440004', '{"vegan"}', '{}', 'en'),
('550e8400-e29b-41d4-a716-446655440005', '{}', '{}', 'en')
ON CONFLICT DO NOTHING;

-- Insert user addresses
INSERT INTO user_addresses (id, user_id, label, street_address, city, state, postal_code, country, is_default) VALUES
('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 'home', '123 MG Road', 'Mumbai', 'Maharashtra', '400001', 'India', true),
('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', 'home', '456 Brigade Road', 'Bangalore', 'Karnataka', '560001', 'India', true)
ON CONFLICT DO NOTHING;

-- Insert restaurant chains
INSERT INTO restaurant_chains (id, name, description, owner_id, is_active) VALUES
('750e8400-e29b-41d4-a716-446655440001', 'Garden Bistro Chain', 'Farm-to-table restaurants across India', '550e8400-e29b-41d4-a716-446655440002', true),
('750e8400-e29b-41d4-a716-446655440002', 'Spice Route Group', 'Authentic Indian cuisine restaurants', '550e8400-e29b-41d4-a716-446655440002', true)
ON CONFLICT DO NOTHING;

-- Insert food categories
INSERT INTO food_categories (id, name, description, sort_order, is_active) VALUES
('850e8400-e29b-41d4-a716-446655440001', 'Appetizers', 'Small dishes served before the main course', 1, true),
('850e8400-e29b-41d4-a716-446655440002', 'Main Courses', 'Primary dishes of the meal', 2, true),
('850e8400-e29b-41d4-a716-446655440003', 'Desserts', 'Sweet dishes served at the end of the meal', 3, true),
('850e8400-e29b-41d4-a716-446655440004', 'Beverages', 'Drinks including alcoholic and non-alcoholic options', 4, true),
('850e8400-e29b-41d4-a716-446655440005', 'Seafood', 'Fresh fish and seafood dishes', 5, true),
('850e8400-e29b-41d4-a716-446655440006', 'Vegetarian', 'Plant-based dishes without meat', 6, true),
('850e8400-e29b-41d4-a716-446655440007', 'Indian', 'Traditional Indian cuisine', 7, true),
('850e8400-e29b-41d4-a716-446655440008', 'Italian', 'Traditional Italian dishes', 8, true)
ON CONFLICT DO NOTHING;

-- Insert restaurants
INSERT INTO restaurants (id, chain_id, name, description, cuisine_type, phone, email, street_address, city, state, postal_code, country, business_hours, delivery_radius_km, minimum_order_amount, delivery_fee, is_active, is_accepting_orders, average_rating) VALUES
('950e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', 'The Garden Bistro - Mumbai', 'Farm-to-table restaurant with fresh, local ingredients', '{"American", "Continental"}', '+91-22-12345678', 'mumbai@gardenbistro.com', '123 Linking Road, Bandra', 'Mumbai', 'Maharashtra', '400050', 'India', '{"monday":"11:00-22:00","tuesday":"11:00-22:00","wednesday":"11:00-22:00","thursday":"11:00-22:00","friday":"11:00-23:00","saturday":"10:00-23:00","sunday":"10:00-21:00"}', 15.0, 200.00, 50.00, true, true, 4.5),

('950e8400-e29b-41d4-a716-446655440002', '750e8400-e29b-41d4-a716-446655440002', 'Spice Route - Delhi', 'Authentic Indian cuisine with traditional spices', '{"Indian", "North Indian"}', '+91-11-23456789', 'delhi@spiceroute.com', '456 Connaught Place', 'New Delhi', 'Delhi', '110001', 'India', '{"monday":"17:00-22:00","tuesday":"17:00-22:00","wednesday":"17:00-22:00","thursday":"17:00-22:00","friday":"17:00-23:00","saturday":"12:00-23:00","sunday":"12:00-21:00"}', 20.0, 300.00, 40.00, true, true, 4.3),

('950e8400-e29b-41d4-a716-446655440003', null, 'Ocean''s Catch - Goa', 'Fresh seafood restaurant with daily catches', '{"Seafood", "Goan"}', '+91-832-3456789', 'goa@oceanscatch.com', '789 Beach Road, Calangute', 'Panaji', 'Goa', '403516', 'India', '{"monday":"16:00-22:00","tuesday":"16:00-22:00","wednesday":"16:00-22:00","thursday":"16:00-22:00","friday":"16:00-23:00","saturday":"15:00-23:00","sunday":"15:00-21:00"}', 10.0, 500.00, 60.00, true, true, 4.7),

('950e8400-e29b-41d4-a716-446655440004', null, 'Mama Rosa''s - Bangalore', 'Traditional Italian family restaurant', '{"Italian", "European"}', '+91-80-4567890', 'bangalore@mamarosas.com', '321 MG Road', 'Bangalore', 'Karnataka', '560001', 'India', '{"monday":"12:00-21:00","tuesday":"12:00-21:00","wednesday":"12:00-21:00","thursday":"12:00-21:00","friday":"12:00-22:00","saturday":"11:00-22:00","sunday":"11:00-20:00"}', 12.0, 250.00, 45.00, true, true, 4.4),

('950e8400-e29b-41d4-a716-446655440005', null, 'Green Leaf Cafe - Pune', 'Healthy vegetarian and vegan options', '{"Vegetarian", "Vegan", "Healthy"}', '+91-20-5678901', 'pune@greenleafcafe.com', '654 FC Road', 'Pune', 'Maharashtra', '411005', 'India', '{"monday":"08:00-20:00","tuesday":"08:00-20:00","wednesday":"08:00-20:00","thursday":"08:00-20:00","friday":"08:00-21:00","saturday":"09:00-21:00","sunday":"09:00-19:00"}', 8.0, 150.00, 30.00, true, true, 4.2)
ON CONFLICT DO NOTHING;

-- Insert food items
INSERT INTO food_items (id, restaurant_id, category_id, name, description, price, ingredients, allergens, dietary_info, calories, prep_time_minutes, is_available, is_featured, average_rating) VALUES
-- Garden Bistro Items
('a50e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', 'Caesar Salad', 'Fresh romaine lettuce with parmesan cheese and croutons', 320.00, '{"romaine lettuce", "parmesan cheese", "croutons", "caesar dressing"}', '{"dairy", "gluten"}', '{"vegetarian"}', 320, 10, true, false, 4.2),

('a50e8400-e29b-41d4-a716-446655440002', '950e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440002', 'Grilled Salmon', 'Atlantic salmon with seasonal vegetables', 850.00, '{"salmon", "asparagus", "carrots", "lemon"}', '{"fish"}', '{"gluten_free"}', 450, 25, true, true, 4.6),

('a50e8400-e29b-41d4-a716-446655440003', '950e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440003', 'Chocolate Cake', 'Rich chocolate cake with berry compote', 280.00, '{"chocolate", "flour", "eggs", "berries"}', '{"dairy", "eggs", "gluten"}', '{"vegetarian"}', 380, 5, true, false, 4.4),

-- Spice Route Items
('a50e8400-e29b-41d4-a716-446655440004', '950e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440002', 'Chicken Tikka Masala', 'Tender chicken in creamy tomato sauce', 450.00, '{"chicken", "tomatoes", "cream", "spices"}', '{"dairy"}', '{"gluten_free"}', 520, 20, true, true, 4.5),

('a50e8400-e29b-41d4-a716-446655440005', '950e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440002', 'Vegetable Biryani', 'Fragrant basmati rice with mixed vegetables', 380.00, '{"basmati rice", "mixed vegetables", "spices"}', '{}', '{"vegetarian", "vegan", "gluten_free"}', 380, 30, true, false, 4.3),

('a50e8400-e29b-41d4-a716-446655440006', '950e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440004', 'Mango Lassi', 'Traditional yogurt drink with mango', 120.00, '{"yogurt", "mango", "sugar"}', '{"dairy"}', '{"vegetarian", "gluten_free"}', 180, 5, true, false, 4.1),

-- Ocean''s Catch Items
('a50e8400-e29b-41d4-a716-446655440007', '950e8400-e29b-41d4-a716-446655440003', '850e8400-e29b-41d4-a716-446655440001', 'Lobster Bisque', 'Creamy lobster soup with cognac', 680.00, '{"lobster", "cream", "cognac", "vegetables"}', '{"shellfish", "dairy"}', '{"gluten_free"}', 280, 15, true, true, 4.8),

('a50e8400-e29b-41d4-a716-446655440008', '950e8400-e29b-41d4-a716-446655440003', '850e8400-e29b-41d4-a716-446655440002', 'Grilled Red Snapper', 'Fresh red snapper with herb butter', 950.00, '{"red snapper", "herbs", "butter", "lemon"}', '{"fish", "dairy"}', '{"gluten_free"}', 340, 20, true, false, 4.7),

-- Mama Rosa''s Items
('a50e8400-e29b-41d4-a716-446655440009', '950e8400-e29b-41d4-a716-446655440004', '850e8400-e29b-41d4-a716-446655440002', 'Margherita Pizza', 'Classic pizza with tomato, mozzarella, and basil', 420.00, '{"pizza dough", "tomato sauce", "mozzarella", "basil"}', '{"dairy", "gluten"}', '{"vegetarian"}', 420, 15, true, false, 4.3),

('a50e8400-e29b-41d4-a716-446655440010', '950e8400-e29b-41d4-a716-446655440004', '850e8400-e29b-41d4-a716-446655440002', 'Spaghetti Carbonara', 'Traditional pasta with eggs, cheese, and pancetta', 480.00, '{"spaghetti", "eggs", "parmesan", "pancetta"}', '{"dairy", "eggs", "gluten"}', '{}', 480, 18, true, true, 4.5),

-- Green Leaf Cafe Items
('a50e8400-e29b-41d4-a716-446655440011', '950e8400-e29b-41d4-a716-446655440005', '850e8400-e29b-41d4-a716-446655440002', 'Quinoa Buddha Bowl', 'Nutritious bowl with quinoa, vegetables, and tahini', 360.00, '{"quinoa", "kale", "chickpeas", "tahini"}', '{}', '{"vegetarian", "vegan", "gluten_free"}', 350, 12, true, true, 4.4),

('a50e8400-e29b-41d4-a716-446655440012', '950e8400-e29b-41d4-a716-446655440005', '850e8400-e29b-41d4-a716-446655440004', 'Green Smoothie', 'Blend of spinach, apple, banana, and almond milk', 180.00, '{"spinach", "apple", "banana", "almond milk"}', '{}', '{"vegetarian", "vegan", "gluten_free"}', 150, 5, true, false, 4.0)
ON CONFLICT DO NOTHING;

-- Insert food item variants
INSERT INTO food_item_variants (food_item_id, name, type, price_modifier, is_default) VALUES
-- Pizza sizes
('a50e8400-e29b-41d4-a716-446655440009', 'Regular', 'size', 0.00, true),
('a50e8400-e29b-41d4-a716-446655440009', 'Large', 'size', 150.00, false),
('a50e8400-e29b-41d4-a716-446655440009', 'Extra Large', 'size', 250.00, false),

-- Spice levels for Indian food
('a50e8400-e29b-41d4-a716-446655440004', 'Mild', 'spice_level', 0.00, true),
('a50e8400-e29b-41d4-a716-446655440004', 'Medium', 'spice_level', 0.00, false),
('a50e8400-e29b-41d4-a716-446655440004', 'Hot', 'spice_level', 0.00, false),

-- Smoothie sizes
('a50e8400-e29b-41d4-a716-446655440012', 'Regular', 'size', 0.00, true),
('a50e8400-e29b-41d4-a716-446655440012', 'Large', 'size', 50.00, false)
ON CONFLICT DO NOTHING;

-- Insert sample orders
INSERT INTO orders (id, order_number, customer_id, restaurant_id, delivery_type, status, subtotal, tax_amount, delivery_fee, total_amount, payment_status, payment_method, delivery_address_id, estimated_delivery_time) VALUES
('b50e8400-e29b-41d4-a716-446655440001', 'ORD-20240115-001', '550e8400-e29b-41d4-a716-446655440003', '950e8400-e29b-41d4-a716-446655440001', 'delivery', 'delivered', 850.00, 76.50, 50.00, 976.50, 'completed', 'upi', '650e8400-e29b-41d4-a716-446655440001', '2024-01-15 20:30:00'),

('b50e8400-e29b-41d4-a716-446655440002', 'ORD-20240116-002', '550e8400-e29b-41d4-a716-446655440004', '950e8400-e29b-41d4-a716-446655440002', 'pickup', 'ready', 450.00, 40.50, 0.00, 490.50, 'completed', 'card', null, '2024-01-16 19:00:00')
ON CONFLICT DO NOTHING;

-- Insert order items
INSERT INTO order_items (order_id, food_item_id, quantity, unit_price, total_price, selected_variants) VALUES
('b50e8400-e29b-41d4-a716-446655440001', 'a50e8400-e29b-41d4-a716-446655440002', 1, 850.00, 850.00, '{}'),
('b50e8400-e29b-41d4-a716-446655440002', 'a50e8400-e29b-41d4-a716-446655440004', 1, 450.00, 450.00, '{"spice_level": "medium"}')
ON CONFLICT DO NOTHING;

-- Insert restaurant reviews
INSERT INTO restaurant_reviews (restaurant_id, user_id, order_id, rating, review_text, is_anonymous) VALUES
('950e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 'b50e8400-e29b-41d4-a716-446655440001', 5, 'Amazing fresh ingredients and great service! The salmon was perfectly cooked.', false),
('950e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', 'b50e8400-e29b-41d4-a716-446655440002', 4, 'Best Indian food in the city! Authentic flavors and great portion sizes.', false),
('950e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', null, 5, 'Fresh seafood and excellent presentation. The ambiance is perfect for dinner.', false),
('950e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', null, 4, 'Great Italian food, just like my grandmother made. Will definitely come back.', false),
('950e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440003', null, 4, 'Perfect for health-conscious diners. Great variety of vegan options.', false)
ON CONFLICT DO NOTHING;

-- Insert food item reviews
INSERT INTO food_item_reviews (food_item_id, user_id, order_id, rating, review_text, is_anonymous) VALUES
('a50e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 'b50e8400-e29b-41d4-a716-446655440001', 5, 'The salmon was cooked to perfection. Highly recommended!', false),
('a50e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', 'b50e8400-e29b-41d4-a716-446655440002', 4, 'Delicious chicken tikka masala with the right amount of spice.', false),
('a50e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440003', null, 5, 'Best lobster bisque I have ever had! Rich and flavorful.', false)
ON CONFLICT DO NOTHING;

-- Update restaurant ratings based on reviews
UPDATE restaurants SET 
    average_rating = (
        SELECT ROUND(AVG(rating::numeric), 1) 
        FROM restaurant_reviews 
        WHERE restaurant_id = restaurants.id
    ),
    total_reviews = (
        SELECT COUNT(*) 
        FROM restaurant_reviews 
        WHERE restaurant_id = restaurants.id
    )
WHERE id IN (
    '950e8400-e29b-41d4-a716-446655440001',
    '950e8400-e29b-41d4-a716-446655440002',
    '950e8400-e29b-41d4-a716-446655440003',
    '950e8400-e29b-41d4-a716-446655440004',
    '950e8400-e29b-41d4-a716-446655440005'
);

-- Update food item ratings based on reviews
UPDATE food_items SET 
    average_rating = (
        SELECT ROUND(AVG(rating::numeric), 1) 
        FROM food_item_reviews 
        WHERE food_item_id = food_items.id
    ),
    total_reviews = (
        SELECT COUNT(*) 
        FROM food_item_reviews 
        WHERE food_item_id = food_items.id
    )
WHERE id IN (
    'a50e8400-e29b-41d4-a716-446655440002',
    'a50e8400-e29b-41d4-a716-446655440004',
    'a50e8400-e29b-41d4-a716-446655440007'
);