import "../../styles/navbar.scss";
import RiskIcon from "../../assets/risk icon.png";
import { IconButton } from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { AiOutlineLogout } from "react-icons/ai";
import { MyThemeContext } from "../../context/MyThemeContext";
import { useContext } from "react";
import { useAuth } from "../../context/AuthContext";
const NavBar = () => {
  const theme = useContext(MyThemeContext);
  const authState = useAuth();
  const handleLogout = () => {};
  return (
    <>
      <div
        className={`navbar-div ${theme.dark ? "navbar-dark" : "navbar-light"}`}
      >
        <div className='navbar-info'>
          <img src={RiskIcon} alt='Risk-Icon' />
          Risk Mangment System
        </div>
        <div className='navbar-controls'>
          <IconButton onClick={theme.toggle}>
            {theme.dark ? (
              <Brightness4Icon sx={{ color: "white", fontSize: "20px" }} />
            ) : (
              <DarkModeIcon sx={{ color: "black", fontSize: "20px" }} />
            )}
          </IconButton>
          {"navbar-links"}
          {authState.user.username}
          <IconButton onClick={handleLogout}>
            {theme.dark ? (
              <AiOutlineLogout style={{ color: "white" }} />
            ) : (
              <AiOutlineLogout style={{ color: "black" }} />
            )}
          </IconButton>
        </div>
      </div>
    </>
  );
};

export default NavBar;
