import { createContext, useState, useEffect, useCallback } from "react";

let logoutTimer;

const AuthContext = createContext();

const calculateRemainingTokenTime = (expirationTime) => {
  const currentTime = new Date().getTime();
  const futureTime = new Date(expirationTime).getTime();

  const remainingTime = futureTime - currentTime;

  return remainingTime;
};

const retrieveStoredToken = () => {
  const storedToken = localStorage.getItem("Accesstoken");
  const userName = localStorage.getItem("userName");
  const storedExpirationDate = localStorage.getItem("expirationTime");

  const remainingTime = calculateRemainingTokenTime(storedExpirationDate);
  if (remainingTime <= 60000) {
    localStorage.removeItem("Accesstoken");
    localStorage.removeItem("expirationTime");
    localStorage.removeItem("userName");
    return null;
  }

  return {
    token: storedToken,
    duration: remainingTime,
    userName: userName,
  };
};
export const AuthContextProvider = (props) => {
  const storedData = retrieveStoredToken();

  let initialToken;
  let initialUser;
  if (storedData) {
    initialToken = storedData.token;
    initialUser = storedData.userName;
  }

  const [token, setToken] = useState(initialToken);
  const [userName, setUserName] = useState(initialUser);
  const userIsLoggedIn = !!token;

  const logoutHandler = useCallback(() => {
    setToken(null);
    localStorage.removeItem("Accesstoken");
    localStorage.removeItem("userName");
    localStorage.removeItem("expirationTime");
    if (logoutTimer) {
      clearTimeout(logoutTimer);
    }
  }, []);
  const loingHandler = (token, username) => {
    setToken(token);
    setUserName(username);
    localStorage.setItem("Accesstoken", token);
    localStorage.setItem("userName", userName);
    let expirationTime = new Date();
    expirationTime = expirationTime.setDate(expirationTime.getDate() + 5);
    localStorage.setItem("expirationTime", expirationTime);
    const remainingTime = calculateRemainingTokenTime(expirationTime);
    logoutTimer = setTimeout(logoutHandler, remainingTime);
  };

  useEffect(() => {
    if (storedData) {
      console.log(storedData.duration);
      logoutTimer = setTimeout(logoutHandler, storedData.duration);
    }
  }, [storedData, logoutHandler]);

  const contextValue = {
    token: token,
    user: userName,
    isLoggedIn: userIsLoggedIn,
    logout: logoutHandler,
    login: loingHandler,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
