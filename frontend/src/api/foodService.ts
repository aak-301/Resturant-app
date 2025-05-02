import api from "./config";
import { API_ENDPOINTS } from "./constants";
import { FoodListResponse, FoodDetailsResponse } from "./types";

/**
 * Fetches the list of meals
 * @returns Promise with the food list
 */
export const getFoodList = async (): Promise<FoodListResponse> => {
  const response = await api.get<FoodListResponse>(API_ENDPOINTS.FOOD_LIST);
  return response.data;
};

/**
 * Fetches the details of a specific meal
 * @param id - The meal ID
 * @returns Promise with the meal details
 */
export const getFoodDetails = async (
  id: string
): Promise<FoodDetailsResponse> => {
  const response = await api.get<FoodDetailsResponse>(
    API_ENDPOINTS.FOOD_DETAILS(id)
  );
  return response.data;
};

// Export a central error handler for API calls
export const handleApiError = (error: any): string => {
  console.error("API Error:", error);

  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    if (error.response.status === 404) {
      return "The requested resource was not found.";
    } else if (error.response.status >= 500) {
      return "Server error. Please try again later.";
    }
    return (
      error.response.data?.message ||
      "An error occurred while processing your request."
    );
  } else if (error.request) {
    // The request was made but no response was received
    return "No response from server. Please check your connection and try again.";
  } else {
    // Something happened in setting up the request that triggered an Error
    return "An unexpected error occurred. Please try again.";
  }
};
