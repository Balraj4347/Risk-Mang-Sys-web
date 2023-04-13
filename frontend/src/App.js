import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./Utils/Layout";
import { MyThemeContext } from "./context/MyThemeContext";
import { useContext } from "react";
import {
  DashBoard,
  LoginPage,
  Portfolio,
  SnpCompare,
  Diversification,
} from "./views";
import NotFound from "./Utils/NotFound";
import ProtectedRoute from "./Utils/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import { RiskAnalysis } from "./views/RiskAnalysis";
import SentimentView from "./views/SentimentView";

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
              <Route
                path='/snp500'
                element={
                  <ProtectedRoute isLogged={isLogged}>
                    <SnpCompare />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/portfolio'
                element={
                  <ProtectedRoute isLogged={isLogged}>
                    <Portfolio />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/diversification'
                element={
                  <ProtectedRoute isLogged={isLogged}>
                    <Diversification />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/risk'
                element={
                  <ProtectedRoute isLogged={isLogged}>
                    <RiskAnalysis />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/sentiment'
                element={
                  <ProtectedRoute isLogged={isLogged}>
                    <SentimentView />
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
