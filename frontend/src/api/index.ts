// Export everything from our API files
export * from "./types";
export * from "./constants";
export * from "./foodService";

// Re-export the default api instance
import api from "./config";
export { api };
