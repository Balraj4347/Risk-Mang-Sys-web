import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./Utils/Layout";
import { MyThemeContext } from "./context/MyThemeContext";
import { useContext } from "react";
import { DashBoard, LoginPage, Portfolio, Charts } from "./views";
import NotFound from "./Utils/NotFound";
import ProtectedRoute from "./Utils/ProtectedRoute";
// import axios from "axios";

function App() {
  const theme = useContext(MyThemeContext);
  return (
    <>
      <div className={`app ${theme.dark ? "dark-mode-app" : ""}`}>
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<LoginPage />} />
            <Route element={<Layout />}>
              <Route
                path='/dashboard'
                element={
                  <ProtectedRoute>
                    <DashBoard />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/charts'
                element={
                  <ProtectedRoute>
                    <Charts />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/portfolio'
                element={
                  <ProtectedRoute>
                    <Portfolio />
                  </ProtectedRoute>
                }
              />
              <Route path='*' element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </div>
    </>
  );
}

export default App;
