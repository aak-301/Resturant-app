import { Router } from 'express';
import { ApiController } from '../controllers/api.controller';
import { ExternalApiController } from '../controllers/external.controller';

const router = Router();

// Database API Routes
router.get('/restaurants', ApiController.getAllRestaurants);
router.get('/restaurants/:restaurantId', ApiController.getRestaurantById);
router.get('/restaurants/:restaurantId/menu', ApiController.getRestaurantMenu);

router.get('/categories', ApiController.getCategories);
router.get('/categories/:categoryId/items', ApiController.getCategoryItems);

router.get('/food-items/:itemId', ApiController.getFoodItemById);

router.get('/search', ApiController.searchFoodItems);
router.get('/featured', ApiController.getFeaturedItems);
router.get('/trending', ApiController.getTrendingItems);

// Fix route order - specific routes before parameterized routes
router.get('/restaurants/city/:city', ApiController.getRestaurantsByCity);
router.get('/restaurants/cuisine/:cuisine', ApiController.getRestaurantsByCuisine);

// External API Routes (TheMealDB)
router.get('/external/food-list', ExternalApiController.getFoodList);
router.get('/external/food-details/:id', ExternalApiController.getFoodDetails);
router.get('/external/food-category/:category', ExternalApiController.getFoodByCategory);
router.get('/external/search', ExternalApiController.searchMeals);

export default router;