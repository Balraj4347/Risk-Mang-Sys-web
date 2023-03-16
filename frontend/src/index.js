import React from "react";
import ReactDOM from "react-dom/client";
import "./index.scss";
import App from "./App";
import { ThemeProvider } from "./context/MyThemeContext";
import { StockProvider } from "./context/StockContext";
import { SnackbarProvider } from "notistack";
import { AuthContextProvider } from "./context/AuthContext";
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <SnackbarProvider maxSnack={3} autoHideDuration={1000}>
      <ThemeProvider>
        <AuthContextProvider>
          <StockProvider>
            <App />
          </StockProvider>
        </AuthContextProvider>
      </ThemeProvider>
    </SnackbarProvider>
  </React.StrictMode>
);
