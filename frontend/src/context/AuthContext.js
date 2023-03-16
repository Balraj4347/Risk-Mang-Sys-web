import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState("");
  const [token, setToken] = useState(undefined);
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    async function loadStorageData() {
      const storageUser = localStorage.getItem("user");
      const storageToken = localStorage.getItem("access_token");
      const refreshToken = localStorage.getItem("refresh_token");
      if (storageToken && storageUser && refreshToken) {
        try {
          const config = {
            headers: {
              "Content-Type": "application/json",
              AccessToken: storageToken,
              RefreshToken: refreshToken,
            },
          };

          const { data } = await axios.get("/api/v1/user/auth", config);

          if (data) {
            setUser(JSON.parse(storageUser));
            setToken(storageToken);
            setIsLogged(true);
          }
        } catch (error) {
          console.log(error);
        }
      } else {
        Logout();
      }
    }
    loadStorageData();
    // eslint-disable-next-line no-use-before-define
  }, []);

  const Login = async ({ email, password }) => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const payload = {
        email: email,
        password: password,
      };
      const { data } = await axios.post("/api/v1/user/login", payload, config);
      const userData = { username: data.user_name, email: data.email };
      const accesstoken = data.access_token;

      setUser(userData);
      setToken(accesstoken);
      setIsLogged(true);

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (err) {
      if (err.respone.status === 403) {
        Logout();
      }
      return false;
    }
    return true;
  };

  const Logout = () => {
    localStorage.clear();
    setUser(null);
    setToken(undefined);
    setIsLogged(false);
  };
  const isLoggedin = () => {
    return isLogged;
  };
  return (
    <AuthContext.Provider
      value={{ token, user, isLogged, isLoggedin, Login, Logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
