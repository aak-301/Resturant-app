import { Request, Response } from 'express';
import axios from 'axios';
import { logger } from '../utils/logger';

// External API response types
interface MealDBResponse {
  meals?: Array<{
    idMeal: string;
    strMeal: string;
    strMealThumb: string;
    [key: string]: any;
  }>;
}

interface MealDetailResponse {
  meals?: Array<{
    idMeal: string;
    strMeal: string;
    strCategory: string;
    strArea: string;
    strInstructions: string;
    strMealThumb: string;
    strYoutube?: string;
    [key: string]: any;
  }>;
}

export class ExternalApiController {
  // Get food list from TheMealDB (Seafood category)
  static async getFoodList(req: Request, res: Response): Promise<void> {
    try {
      const response = await axios.get<MealDBResponse>(
        "https://www.themealdb.com/api/json/v1/1/filter.php?c=Seafood",
        {
          timeout: 10000,
          headers: {
            'User-Agent': 'RestaurantApp/1.0'
          }
        }
      );

      res.json({
        success: true,
        data: response.data,
        count: response.data.meals?.length || 0
      });
    } catch (error: any) {
      logger.error("Error fetching food list from external API:", {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        url: error.config?.url
      });

      let errorMessage = "Failed to fetch food list";
      let statusCode = 500;

      if (error.code === 'ECONNABORTED') {
        errorMessage = "Request timeout - external service is slow";
        statusCode = 504;
      } else if (error.response?.status) {
        statusCode = error.response.status >= 500 ? 502 : error.response.status;
        errorMessage = `External service error: ${error.response.status}`;
      } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        errorMessage = "External service unavailable";
        statusCode = 503;
      }

      res.status(statusCode).json({
        success: false,
        message: errorMessage,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get food details by ID from TheMealDB
  static async getFoodDetails(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: "Food ID is required"
        });
        return;
      }

      if (!/^\d+$/.test(id)) {
        res.status(400).json({
          success: false,
          message: "Invalid food ID format"
        });
        return;
      }

      const response = await axios.get<MealDetailResponse>(
        `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`,
        {
          timeout: 10000,
          headers: {
            'User-Agent': 'RestaurantApp/1.0'
          }
        }
      );

      if (!response.data.meals || response.data.meals.length === 0) {
        res.status(404).json({
          success: false,
          message: "Food item not found"
        });
        return;
      }

      res.json({
        success: true,
        data: response.data
      });
    } catch (error: any) {
      logger.error("Error fetching food details from external API:", {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        url: error.config?.url,
        id: req.params.id
      });

      let errorMessage = "Failed to fetch food details";
      let statusCode = 500;

      if (error.code === 'ECONNABORTED') {
        errorMessage = "Request timeout - external service is slow";
        statusCode = 504;
      } else if (error.response?.status) {
        statusCode = error.response.status >= 500 ? 502 : error.response.status;
        errorMessage = `External service error: ${error.response.status}`;
      } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        errorMessage = "External service unavailable";
        statusCode = 503;
      }

      res.status(statusCode).json({
        success: false,
        message: errorMessage,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get food by category from TheMealDB
  static async getFoodByCategory(req: Request, res: Response): Promise<void> {
    try {
      const { category } = req.params;

      if (!category) {
        res.status(400).json({
          success: false,
          message: "Category is required"
        });
        return;
      }

      if (category.length < 2 || category.length > 50) {
        res.status(400).json({
          success: false,
          message: "Invalid category format"
        });
        return;
      }

      const response = await axios.get<MealDBResponse>(
        `https://www.themealdb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(category)}`,
        {
          timeout: 10000,
          headers: {
            'User-Agent': 'RestaurantApp/1.0'
          }
        }
      );

      res.json({
        success: true,
        data: response.data,
        count: response.data.meals?.length || 0
      });
    } catch (error: any) {
      logger.error("Error fetching food by category from external API:", {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        category: req.params.category
      });

      let errorMessage = "Failed to fetch food by category";
      let statusCode = 500;

      if (error.code === 'ECONNABORTED') {
        errorMessage = "Request timeout - external service is slow";
        statusCode = 504;
      } else if (error.response?.status) {
        statusCode = error.response.status >= 500 ? 502 : error.response.status;
        errorMessage = `External service error: ${error.response.status}`;
      } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        errorMessage = "External service unavailable";
        statusCode = 503;
      }

      res.status(statusCode).json({
        success: false,
        message: errorMessage,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Search meals from TheMealDB
  static async searchMeals(req: Request, res: Response): Promise<void> {
    try {
      const { q } = req.query;

      if (!q || typeof q !== 'string') {
        res.status(400).json({
          success: false,
          message: "Search query is required"
        });
        return;
      }

      if (q.length < 2 || q.length > 100) {
        res.status(400).json({
          success: false,
          message: "Search query must be between 2 and 100 characters"
        });
        return;
      }

      const response = await axios.get<MealDBResponse>(
        `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(q)}`,
        {
          timeout: 10000,
          headers: {
            'User-Agent': 'RestaurantApp/1.0'
          }
        }
      );

      res.json({
        success: true,
        data: response.data,
        count: response.data.meals?.length || 0
      });
    } catch (error: any) {
      logger.error("Error searching meals from external API:", {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        query: req.query.q
      });

      let errorMessage = "Failed to search meals";
      let statusCode = 500;

      if (error.code === 'ECONNABORTED') {
        errorMessage = "Request timeout - external service is slow";
        statusCode = 504;
      } else if (error.response?.status) {
        statusCode = error.response.status >= 500 ? 502 : error.response.status;
        errorMessage = `External service error: ${error.response.status}`;
      } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        errorMessage = "External service unavailable";
        statusCode = 503;
      }

      res.status(statusCode).json({
        success: false,
        message: errorMessage,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}