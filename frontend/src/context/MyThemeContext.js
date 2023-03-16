import { createContext } from "react";
import { useState } from "react";

const MyThemeContext = createContext();

function ThemeProvider({ children }) {
  const [dark, setDark] = useState(true);
  const toggleTheme = () => {
    setDark(!dark);
  };
  return (
    <MyThemeContext.Provider value={{ dark: dark, toggle: toggleTheme }}>
      {children}
    </MyThemeContext.Provider>
  );
}
export { MyThemeContext, ThemeProvider };
