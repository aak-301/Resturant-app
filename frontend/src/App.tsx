import React from "react";
import FoodList from "./components/FoodList";
import { Container } from "@mui/material";

function App() {
  return (
    <Container maxWidth="lg">
      <FoodList />
    </Container>
  );
}

export default App;
