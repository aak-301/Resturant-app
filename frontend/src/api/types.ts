// Meal basic information
export interface Meal {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
}

// Extended meal details
export interface MealDetails extends Meal {
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strYoutube: string;
  strTags: string;
}

// API response types
export interface FoodListResponse {
  meals: Meal[];
}

export interface FoodDetailsResponse {
  meals: MealDetails[];
}
