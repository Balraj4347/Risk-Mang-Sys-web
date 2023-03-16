import "../styles/Login.scss";

import { useSnackbar } from "notistack";
import landingImage from "../assets/landingImage.jpeg";
import { useState, useEffect } from "react";
import { FaUserAlt, FaKey } from "react-icons/fa";
import { AiOutlineMail } from "react-icons/ai";
import CircularProgress from "@mui/material/CircularProgress";
import { useAuth } from "../context/AuthContext";
import isEmail from "validator/lib/isEmail";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const authState = useAuth();

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
          <LoginForm authState={authState} />
        ) : (
          <RegisterForm authState={authState} />
        )}
        <div className='switch-btn' onClick={toggleLogin}>
          <p>{loginView ? "Sign-Up" : "Log-In"}</p>
        </div>
      </div>
    </div>
  );
};

const LoginForm = ({ authState }) => {
  const [userEmail, setUserEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const handleLogin = async () => {
    setIsLoading(true);
    if (!isEmail(userEmail) || !password) {
      enqueueSnackbar("Enter Valid credentials", {
        variant: "error",
      });
      setIsLoading(false);
      return;
    }

    try {
      authState.Login({ email: userEmail, password: password });
    } catch (error) {
      let resp = error.response;
      console.log(resp);
      enqueueSnackbar(resp.status + ": " + resp.data.message, {
        variant: "error",
      });
    }
    setIsLoading(false);
  };
  useEffect(() => {
    if (authState.isLoggedin()) navigate("/dashboard");
    // eslint-disable-next-line
  }, [authState.isLogged]);
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
        {isLoading ? (
          <CircularProgress style={{ width: "20px", height: "20px" }} />
        ) : (
          "Log-In"
        )}
      </button>
    </div>
  );
};
const RegisterForm = ({ authState }) => {
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confPassword, setConfPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const handleRegistration = () => {
    setIsLoading(true);
    setIsLoading(false);
  };
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
        {isLoading ? (
          <CircularProgress style={{ width: "20px", height: "20px" }} />
        ) : (
          "Sign-Up"
        )}
      </button>
    </div>
  );
};

export default LoginPage;
