import "../../styles/navbar.scss";
import RiskIcon from "../../assets/risk icon.png";
import { IconButton } from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { MyThemeContext } from "../../context/MyThemeContext";
import { useContext } from "react";
const NavBar = () => {
  const theme = useContext(MyThemeContext);
  return (
    <>
      <div
        className={`navbar-div ${theme.dark ? "navbar-dark" : "navbar-light"}`}
      >
        <div className='navbar-info'>
          <img src={RiskIcon} alt='Risk-Icon' />
          navbar-info
        </div>
        <div className='navbar-controls'>
          <IconButton onClick={theme.toggle}>
            {theme.dark ? (
              <Brightness4Icon sx={{ color: "white", fontSize: "20px" }} />
            ) : (
              <DarkModeIcon sx={{ color: "white", fontSize: "20px" }} />
            )}
          </IconButton>
          navbar-links
        </div>
      </div>
    </>
  );
};

export default NavBar;
