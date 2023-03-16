import { Outlet } from "react-router-dom";
import Footer from "../Components/Footer";
import NavBar from "../Components/NavBar";
import SideBar from "../Components/SideBar";

const Layout = () => {
  return (
    <>
      <NavBar />
      <div className='mainPage'>
        <SideBar />

        <div className='layout-container'>
          <Outlet />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Layout;
