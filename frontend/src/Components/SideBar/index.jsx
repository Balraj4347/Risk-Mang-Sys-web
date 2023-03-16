import "../../styles/sideBar.scss";
import { SideBarItems } from "../../Utils/sideBarItems";
import { Link } from "react-router-dom";
import { MyThemeContext } from "../../context/MyThemeContext";
import { useContext } from "react";
const SideBar = () => {
  const theme = useContext(MyThemeContext);
  return (
    <div
      className={`sidebarContainer ${
        theme.dark ? "sidebar-dark" : "sidebar-light"
      }`}
    >
      <ul>
        {SideBarItems.map((item, idx) => {
          return (
            <Link to={item.path} key={idx}>
              <li className={theme.dark ? "dark" : "light"}>
                <span id='sidebar-icon'>{item.icon}</span>
                <span>{item.title}</span>
              </li>
            </Link>
          );
        })}
      </ul>
    </div>
  );
};

export default SideBar;
