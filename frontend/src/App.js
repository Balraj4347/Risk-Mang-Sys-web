import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./Utils/Layout";
import { MyThemeContext } from "./context/MyThemeContext";
import { useContext } from "react";
import { DashBoard, LoginPage, Portfolio } from "./views";
import NotFound from "./Utils/NotFound";
import ProtectedRoute from "./Utils/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

function App() {
  const theme = useContext(MyThemeContext);
  const authState = useAuth();
  const isLogged = authState.isLoggedin();
  return (
    <>
      <div className={`app ${theme.dark ? "dark-mode-app" : ""}`}>
        <BrowserRouter>
          <Routes>
            <Route path='/login' element={<LoginPage />} />

            <Route element={<Layout />}>
              <Route
                path='/'
                element={
                  <ProtectedRoute isLogged={isLogged}>
                    <DashBoard />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/dashboard'
                element={
                  <ProtectedRoute isLogged={isLogged}>
                    <DashBoard />
                  </ProtectedRoute>
                }
              />
              {/* <Route
                path='/charts'
                element={
                  <ProtectedRoute isLogged={isLogged}>
                    <Charts />
                  </ProtectedRoute>
                }
              /> */}
              <Route
                path='/portfolio'
                element={
                  <ProtectedRoute isLogged={isLogged}>
                    <Portfolio />
                  </ProtectedRoute>
                }
              />
              <Route
                path='*'
                element={
                  <ProtectedRoute isLogged={isLogged}>
                    <NotFound />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </div>
    </>
  );
}

export default App;
