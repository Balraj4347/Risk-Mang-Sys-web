import "../styles/Login.scss";
import axios from "axios";
import { useSnackbar } from "notistack";
import { useContext } from "react";
import landingImage from "../assets/landingImage.jpeg";
import { useState } from "react";
import { FaUserAlt, FaKey } from "react-icons/fa";
import { AiOutlineMail } from "react-icons/ai";
import CircularProgress from "@mui/material/CircularProgress";
import AuthContext from "../context/AuthContext";
import isEmail from "validator/lib/isEmail";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const authContext = useContext(AuthContext);

  const [loginView, setLoginView] = useState(true);
  const toggleLogin = () => {
    setLoginView(!loginView);
  };
  return (
    <div
      className='login-container'
      style={{
        background: `url('${landingImage}')`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
    >
      <div id='Page-Heading'>Risk Mangment System</div>
      <div className='login-wrapper'>
        <h5>{loginView ? "Login" : "Sign-Up"}</h5>
        {loginView ? (
          <LoginForm authContext={authContext} />
        ) : (
          <RegisterForm authContext={authContext} />
        )}
        <div className='switch-btn' onClick={toggleLogin}>
          <p>{loginView ? "Sign-Up" : "Log-In"}</p>
        </div>
      </div>
    </div>
  );
};

const LoginForm = ({ authContext }) => {
  const [userEmail, setUserEmail] = useState("");
  const [password, setPassword] = useState("");
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const handleLogin = async () => {
    if (!isEmail(userEmail) || !password) {
      enqueueSnackbar("Enter Valid credentials", {
        variant: "error",
      });
      return;
    }
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const payload = {
        email: userEmail,
        password: password,
      };
      const { data } = await axios.post("/api/v1/user/login", payload, config);
      console.log(data);
      authContext.login(data.access_token, data.user_name);
      console.log(authContext);
    } catch (error) {
      let resp = error.response;
      console.log(resp);
      enqueueSnackbar(resp.status + ": " + resp.data.message, {
        variant: "error",
      });
    }
  };
  return (
    <div className='input-fields'>
      <span>
        <input
          id='login-useremail'
          type='email'
          value={userEmail}
          onChange={(e) => {
            setUserEmail(e.target.value);
          }}
          required
        />
        <label
          className={`label ${userEmail && "label-filled"}`}
          htmlFor='login-useremail'
        >
          <AiOutlineMail />
          User Email
        </label>
      </span>
      <span>
        <input
          id='login-password'
          type='password'
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
          }}
          required
        />
        <label
          className={`label ${password && "label-filled"}`}
          htmlFor='login-password'
        >
          <FaKey />
          Password
        </label>
      </span>
      <button id='login-sbmt-btn' type='submit' onClick={handleLogin}>
        {authContext.isloading ? (
          <CircularProgress style={{ width: "20px", height: "20px" }} />
        ) : (
          "Log-In"
        )}
      </button>
    </div>
  );
};
const RegisterForm = ({ authContext }) => {
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confPassword, setConfPassword] = useState("");

  const handleRegistration = () => {};
  return (
    <div className='input-fields'>
      <span>
        <input
          id='register-username'
          type='text'
          value={userName}
          onChange={(e) => {
            setUserName(e.target.value);
          }}
          required
        />
        <label
          className={`label ${userName && "label-filled"}`}
          htmlFor='register-userName'
        >
          <FaUserAlt />
          User Name
        </label>
      </span>
      <span>
        <input
          id='register-useremail'
          type='email'
          value={userEmail}
          onChange={(e) => {
            setUserEmail(e.target.value);
          }}
          required
        />
        <label
          className={`label ${userName && "label-filled"}`}
          htmlFor='register-useremail'
        >
          <AiOutlineMail />
          User Email
        </label>
      </span>
      <span>
        <input
          id='register-firstName'
          type='text'
          value={firstName}
          onChange={(e) => {
            setFirstName(e.target.value);
          }}
          required
        />
        <label
          className={`label ${firstName && "label-filled"}`}
          htmlFor='register-firstName'
        >
          First Name
        </label>
      </span>
      <span>
        <input
          id='register-lastName'
          type='text'
          value={lastName}
          onChange={(e) => {
            setLastName(e.target.value);
          }}
          required
        />
        <label
          className={`label ${lastName && "label-filled"}`}
          htmlFor='register-lastName'
        >
          Last Name
        </label>
      </span>
      <span>
        <input
          id='register-password'
          type='password'
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
          }}
          required
        />
        <label
          className={`label ${password && "label-filled"}`}
          htmlFor='register-password'
        >
          <FaKey />
          Password
        </label>
      </span>
      <span>
        <input
          id='register-cpassword'
          type='password'
          value={confPassword}
          onChange={(e) => {
            setConfPassword(e.target.value);
          }}
          required
        />
        <label
          className={`label ${confPassword && "label-filled"}`}
          htmlFor='register-cpassword'
        >
          <FaKey />
          Confirm Password
        </label>
      </span>
      <button id='register-sbmt-btn' type='submit' onClick={handleRegistration}>
        {authContext.isloading ? (
          <CircularProgress style={{ width: "20px", height: "20px" }} />
        ) : (
          "Sign-Up"
        )}
      </button>
    </div>
  );
};

export default LoginPage;
