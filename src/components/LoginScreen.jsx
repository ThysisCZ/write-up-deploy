import { React, useState } from 'react';
import LogoCard from './LogoCard';
import { ClipLoader } from "react-spinners";
import FetchHelper from '../fetchHelper';
import Icon from '@mui/material/Icon';
import { Visibility, VisibilityOff } from "@mui/icons-material";

export default function LoginScreen({ onSignUp = () => { }, onLoginSuccess = () => { }, loginLocal }) {
  const [loginCall, setLoginCall] = useState({ state: "inactive" });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [validationState, setValidationState] = useState(
    {
      email: "valid",
      password: "valid",
      overall: "valid"
    }
  );

  const [visibility, setVisibility] = useState(false);

  const handleLogin = async () => {
    // TODO: when backend ready -> fetch('/auth/login', {method:'POST', body: JSON.stringify({email,password})})
    // temporary: simulate loading and success
    var isValid = true
    var newValidationState = {
      email: "valid",
      password: "valid",
      overall: "valid"
    }

    if (!password) { isValid = false; newValidationState.password = "Please enter your password"; }
    if (!email) { isValid = false; newValidationState.email = "Please enter your email"; }

    if (isValid) {
      // Call backend to log in user
      const result = await FetchHelper.user.login(
        {
          email: email,
          password: password
        }
      )
      console.log(result);

      const response = result.response;

      // If request is succesful
      if (!result.ok) {
        if (response.message === 'Invalid password') {
          newValidationState.password = response.message
        } else {
          newValidationState.email = response.message
        }

        newValidationState.overall = "Something went wrong...";
      } else {
        // Response is succesful, handle response data
        if (response.accessToken) {
          loginLocal(response)
          onLoginSuccess();
        } else {
          newValidationState.overall = response.message ?? "Something went wrong...";
        }
      }
    } else {
      newValidationState.overall = "Something went wrong...";
    }

    setValidationState(newValidationState);
  }

  return (
    <div className="auth-root">
      <div className="auth-container auth-container-login">
        <div>
          <LogoCard />
        </div>
        <h1 className="title">Welcome</h1>
        <p className="subtitle">Log in to your account</p>
        <input className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <div className="error-message">{validationState.email != "valid" ? validationState.email : ""}</div>

        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 10 }}>
          <input className="input" type={visibility ? undefined : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
            style={{ width: 283 }} />
          <Icon style={{ marginTop: 10 }} onClick={() => setVisibility(!visibility)}>
            {visibility ? <Visibility /> : <VisibilityOff />}
          </Icon>
        </div>
        <div className="error-message">{validationState.password != "valid" ? validationState.password : ""}</div>


        <button className="cta" onClick={handleLogin} style={{ marginTop: 18 }}>{
          loginCall.state === "pending" ?
            <ClipLoader color="white" size={20} /> : "Log in"
        }
        </button>
        <div className="error-message">{validationState.overall != "valid" ? validationState.overall : ""}</div>


        <button className="link" onClick={onSignUp}>Don’t have an account? Sign up</button>
      </div>
    </div>
  );
}