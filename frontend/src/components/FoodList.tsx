import React, { useEffect, useState } from "react";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  CircularProgress,
  useMediaQuery,
  useTheme,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

// Import API services and types
import {
  getFoodList,
  getFoodDetails,
  handleApiError,
} from "../api/foodService";
import { Meal, MealDetails } from "../api/types";

// Card size variations
const sizeVariants = [
  {
    xs: "100%",
    sm: "100%",
    md: "48%",
    lg: "31%",
    height: 180,
  },
  {
    xs: "100%",
    sm: "47%",
    md: "31%",
    lg: "23%",
    height: 160,
  },
  {
    xs: "100%",
    sm: "100%",
    md: "65%",
    lg: "48%",
    height: 220,
  },
  {
    xs: "100%",
    sm: "47%",
    md: "31%",
    lg: "23%",
    height: 160,
  },
  {
    xs: "100%",
    sm: "47%",
    md: "48%",
    lg: "31%",
    height: 180,
  },
];

const FoodList: React.FC = () => {
  const [foodList, setFoodList] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMeal, setSelectedMeal] = useState<MealDetails | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getFoodList();
        setFoodList(response.meals || []);
      } catch (err) {
        setError(handleApiError(err));
      } finally {
        setLoading(false);
      }
    };

    fetchMeals();
  }, []);

  const handleFetchMealDetails = async (id: string) => {
    try {
      setError(null);
      const response = await getFoodDetails(id);
      if (response.meals && response.meals.length > 0) {
        setSelectedMeal(response.meals[0]);
        setDialogOpen(true);
      } else {
        setError("Meal details not found");
      }
    } catch (err) {
      setError(handleApiError(err));
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedMeal(null);
  };

  // Function to get a size variant for a meal based on its index
  const getSizeVariant = (index: number) => {
    return sizeVariants[index % sizeVariants.length];
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        sx={{ mt: 10 }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" mt={10}>
        <Typography color="error" variant="h6">
          {error}
        </Typography>
        <Typography variant="body1" mt={2}>
          Please check your connection or try again later.
        </Typography>
      </Box>
    );
  }

  if (foodList.length === 0) {
    return (
      <Box textAlign="center" mt={10}>
        <Typography variant="h6">No meals found</Typography>
      </Box>
    );
  }

  return (
    <>
      <Typography variant="h4" align="center" sx={{ mt: 4, mb: 3 }}>
        🍽️ Seafood Menu
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          justifyContent: "center",
          padding: 3,
        }}
      >
        {foodList.map((meal, index) => {
          const variant = getSizeVariant(index);
          return (
            <Box
              key={meal.idMeal}
              sx={{
                width: {
                  xs: variant.xs,
                  sm: variant.sm,
                  md: variant.md,
                  lg: variant.lg,
                },
                transform:
                  index % 3 === 0
                    ? "translateY(10px)"
                    : index % 4 === 0
                    ? "translateY(-15px)"
                    : "translateY(0px)",
              }}
            >
              <Card
                onClick={() => handleFetchMealDetails(meal.idMeal)}
                sx={{
                  height: "100%",
                  cursor: "pointer",
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    transform: "scale(1.05)",
                    boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
                  },
                }}
              >
                <CardMedia
                  component="img"
                  height={variant.height}
                  image={meal.strMealThumb}
                  alt={meal.strMeal}
                />
                <CardContent>
                  <Typography
                    variant={index % 3 === 0 ? "h6" : "body1"}
                    fontWeight={index % 2 === 0 ? "bold" : "normal"}
                    noWrap
                  >
                    {meal.strMeal}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          );
        })}
      </Box>

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        fullScreen={fullScreen}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedMeal?.strMeal}
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {selectedMeal ? (
            <>
              <img
                src={selectedMeal.strMealThumb}
                alt={selectedMeal.strMeal}
                style={{
                  width: "100%",
                  borderRadius: "8px",
                  marginBottom: "1rem",
                }}
              />
              <Typography variant="body1" paragraph>
                <strong>Category:</strong> {selectedMeal.strCategory}
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>Area:</strong> {selectedMeal.strArea}
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
                {selectedMeal.strInstructions}
              </Typography>
              {selectedMeal.strYoutube && (
                <Typography variant="body2" sx={{ mt: 2 }}>
                  <a
                    href={selectedMeal.strYoutube}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    ▶️ Watch on YouTube
                  </a>
                </Typography>
              )}
            </>
          ) : (
            <Typography>Loading meal details...</Typography>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FoodList;
