import { Request, Response } from 'express';
import { database } from '../utils/database/database_setup';
import { restaurantQueries } from '../queries/restaurant.queries';
import { foodQueries } from '../queries/food.queries';
import { categoryQueries } from '../queries/category.queries';
import { logger } from '../utils/logger';
import {
  ApiResponse,
  Restaurant,
  FoodItem,
  FoodCategory,
  RestaurantWithMenu,
  MenuByCategory,
  SearchParams,
  QueryResult
} from '../types';

export class ApiController {
  // Get all restaurants with menu items
  static async getAllRestaurants(req: Request, res: Response): Promise<void> {
    try {
      const result: QueryResult<RestaurantWithMenu> = await database.query(
        restaurantQueries.getAllRestaurantsWithMenu
      );

      const response: ApiResponse<RestaurantWithMenu[]> = {
        success: true,
        data: result.rows,
        count: result.rows.length
      };

      res.json(response);
    } catch (error: any) {
      logger.error('Error fetching restaurants:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
      res.status(500).json(response);
    }
  }

  // Get specific restaurant by ID
  static async getRestaurantById(req: Request, res: Response): Promise<void> {
    try {
      const { restaurantId } = req.params;

      if (!restaurantId) {
        const response: ApiResponse = {
          success: false,
          message: 'Restaurant ID is required'
        };
        res.status(400).json(response);
        return;
      }

      const result: QueryResult<Restaurant> = await database.query(
        restaurantQueries.getRestaurantById,
        [restaurantId]
      );

      if (result.rows.length === 0) {
        const response: ApiResponse = {
          success: false,
          message: 'Restaurant not found'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<Restaurant> = {
        success: true,
        data: result.rows[0]
      };

      res.json(response);
    } catch (error: any) {
      logger.error('Error fetching restaurant:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
      res.status(500).json(response);
    }
  }

  // Get restaurant menu with categories and variants
  static async getRestaurantMenu(req: Request, res: Response): Promise<void> {
    try {
      const { restaurantId } = req.params;

      if (!restaurantId) {
        const response: ApiResponse = {
          success: false,
          message: 'Restaurant ID is required'
        };
        res.status(400).json(response);
        return;
      }

      const result: QueryResult<FoodItem> = await database.query(
        foodQueries.getRestaurantMenu,
        [restaurantId]
      );

      // Group by categories
      const groupedByCategory: MenuByCategory = result.rows.reduce((acc, item) => {
        const category = item.category_name || 'Other';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(item);
        return acc;
      }, {} as MenuByCategory);

      const response: ApiResponse<MenuByCategory> = {
        success: true,
        data: groupedByCategory
      };

      res.json(response);
    } catch (error: any) {
      logger.error('Error fetching menu:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
      res.status(500).json(response);
    }
  }

  // Get food categories
  static async getCategories(req: Request, res: Response): Promise<void> {
    try {
      const result: QueryResult<FoodCategory> = await database.query(
        categoryQueries.getAllCategories
      );

      const response: ApiResponse<FoodCategory[]> = {
        success: true,
        data: result.rows
      };

      res.json(response);
    } catch (error: any) {
      logger.error('Error fetching categories:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
      res.status(500).json(response);
    }
  }

  // Get food items by category
  static async getCategoryItems(req: Request, res: Response): Promise<void> {
    try {
      const { categoryId } = req.params;

      if (!categoryId) {
        const response: ApiResponse = {
          success: false,
          message: 'Category ID is required'
        };
        res.status(400).json(response);
        return;
      }

      const result: QueryResult<FoodItem> = await database.query(
        foodQueries.getFoodItemsByCategory,
        [categoryId]
      );

      const response: ApiResponse<FoodItem[]> = {
        success: true,
        data: result.rows,
        count: result.rows.length
      };

      res.json(response);
    } catch (error: any) {
      logger.error('Error fetching category items:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
      res.status(500).json(response);
    }
  }

  // Get specific food item with variants
  static async getFoodItemById(req: Request, res: Response): Promise<void> {
    try {
      const { itemId } = req.params;

      if (!itemId) {
        const response: ApiResponse = {
          success: false,
          message: 'Food item ID is required'
        };
        res.status(400).json(response);
        return;
      }

      const result: QueryResult<FoodItem> = await database.query(
        foodQueries.getFoodItemById,
        [itemId]
      );

      if (result.rows.length === 0) {
        const response: ApiResponse = {
          success: false,
          message: 'Food item not found'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<FoodItem> = {
        success: true,
        data: result.rows[0]
      };

      res.json(response);
    } catch (error: any) {
      logger.error('Error fetching food item:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
      res.status(500).json(response);
    }
  }

  // Search food items with advanced filters
  static async searchFoodItems(req: Request, res: Response): Promise<void> {
    try {
      const { q, category, restaurant, diet, min_price, max_price }: SearchParams = req.query;
      let result: QueryResult<FoodItem>;

      if (q) {
        // Text search
        const searchTerm = String(q);
        result = await database.query(
          foodQueries.searchFoodItems,
          [searchTerm, `%${searchTerm}%`]
        );
      } else if (category) {
        // Category filter
        result = await database.query(
          foodQueries.getFoodItemsByCategory,
          [category]
        );
      } else if (diet) {
        // Dietary filter
        result = await database.query(
          foodQueries.getFoodItemsByDiet,
          [diet]
        );
      } else if (min_price && max_price) {
        // Price range filter
        const minPrice = parseFloat(String(min_price));
        const maxPrice = parseFloat(String(max_price));
        
        if (isNaN(minPrice) || isNaN(maxPrice)) {
          const response: ApiResponse = {
            success: false,
            message: 'Invalid price range values'
          };
          res.status(400).json(response);
          return;
        }

        result = await database.query(
          foodQueries.getFoodItemsByPriceRange,
          [minPrice, maxPrice]
        );
      } else {
        // Default: return featured items
        result = await database.query(
          foodQueries.getFeaturedFoodItems,
          [20]
        );
      }

      const response: ApiResponse<FoodItem[]> = {
        success: true,
        data: result.rows,
        count: result.rows.length
      };

      res.json(response);
    } catch (error: any) {
      logger.error('Error searching food items:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
      res.status(500).json(response);
    }
  }

  // Get featured/popular items
  static async getFeaturedItems(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 20;

      if (limit < 1 || limit > 100) {
        const response: ApiResponse = {
          success: false,
          message: 'Limit must be between 1 and 100'
        };
        res.status(400).json(response);
        return;
      }

      const result: QueryResult<FoodItem> = await database.query(
        foodQueries.getFeaturedFoodItems,
        [limit]
      );

      const response: ApiResponse<FoodItem[]> = {
        success: true,
        data: result.rows
      };

      res.json(response);
    } catch (error: any) {
      logger.error('Error fetching featured items:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
      res.status(500).json(response);
    }
  }

  // Get trending items
  static async getTrendingItems(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 20;

      if (limit < 1 || limit > 100) {
        const response: ApiResponse = {
          success: false,
          message: 'Limit must be between 1 and 100'
        };
        res.status(400).json(response);
        return;
      }

      const result: QueryResult<FoodItem> = await database.query(
        foodQueries.getTrendingFoodItems,
        [limit]
      );

      const response: ApiResponse<FoodItem[]> = {
        success: true,
        data: result.rows
      };

      res.json(response);
    } catch (error: any) {
      logger.error('Error fetching trending items:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
      res.status(500).json(response);
    }
  }

  // Get restaurants by city
  static async getRestaurantsByCity(req: Request, res: Response): Promise<void> {
    try {
      const { city } = req.params;

      if (!city) {
        const response: ApiResponse = {
          success: false,
          message: 'City is required'
        };
        res.status(400).json(response);
        return;
      }

      const result: QueryResult<Restaurant> = await database.query(
        restaurantQueries.getRestaurantsByCity,
        [`%${city}%`]
      );

      const response: ApiResponse<Restaurant[]> = {
        success: true,
        data: result.rows,
        count: result.rows.length
      };

      res.json(response);
    } catch (error: any) {
      logger.error('Error fetching restaurants by city:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
      res.status(500).json(response);
    }
  }

  // Get restaurants by cuisine
  static async getRestaurantsByCuisine(req: Request, res: Response): Promise<void> {
    try {
      const { cuisine } = req.params;

      if (!cuisine) {
        const response: ApiResponse = {
          success: false,
          message: 'Cuisine is required'
        };
        res.status(400).json(response);
        return;
      }

      const result: QueryResult<Restaurant> = await database.query(
        restaurantQueries.getRestaurantsByCuisine,
        [cuisine]
      );

      const response: ApiResponse<Restaurant[]> = {
        success: true,
        data: result.rows,
        count: result.rows.length
      };

      res.json(response);
    } catch (error: any) {
      logger.error('Error fetching restaurants by cuisine:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
      res.status(500).json(response);
    }
  }
}