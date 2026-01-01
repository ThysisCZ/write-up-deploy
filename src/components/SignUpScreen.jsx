import React, { useState } from 'react';
import LogoCard from './LogoCard';
import { ClipLoader } from "react-spinners";
import FetchHelper from '../fetchHelper';
import Icon from '@mui/material/Icon';
import { Visibility, VisibilityOff } from "@mui/icons-material";
import "../styles/auth.css";

export default function SignUpScreen({ onLogin = () => { }, onRegisterSuccess = () => { }, loginLocal }) {
  const [isAuthor, setIsAuthor] = useState(false);
  const [registerCall, setRegisterCall] = useState({ state: "inactive" });

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [validationState, setValidationState] = useState(
    {
      username: "valid",
      email: "valid",
      password: "valid",
      overall: "valid"
    }
  );

  const [visibility, setVisibility] = useState(false);

  const handleRegister = async () => {
    // TODO: when backend ready -> fetch('/auth/login', {method:'POST', body: JSON.stringify({email,password})})
    // temporary: simulate loading and success
    var isValid = true
    var newValidationState = {
      username: [],
      email: "valid",
      password: [],
      overall: "valid"
    }

    if (!username) { isValid = false; newValidationState.username.push("A username is required") }
    if (!email) { isValid = false; newValidationState.email = "An email is required"; }
    if (!password) { isValid = false; newValidationState.password.push("A password is required") }

    if (password && password.length < 10) { isValid = false; newValidationState.password.push("• Password must be at least 10 characters long") }
    if (password && password.toUpperCase() == password) { isValid = false; newValidationState.password.push("• Password must include lowercase characters") }
    if (password && password.toLowerCase() == password) { isValid = false; newValidationState.password.push("• Password must include uppercase characters") }

    var passwordRegEx = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
    var spaceRegEx = /[\s]/;
    var punctRegEx = /[\.,;:?!'"]/;

    if (password && !passwordRegEx.test(password)) { isValid = false; newValidationState.password.push("• Password must include a special character") }
    if (username && spaceRegEx.test(username)) { isValid = false; newValidationState.username.push("• Spaces are not allowed") }
    if (username && punctRegEx.test(username)) { isValid = false; newValidationState.username.push("• Punctuation (.,;:?!'\") is not allowed") }

    if (isValid) {
      // Call backend to register user
      const result = await FetchHelper.user.register(
        {
          username: username,
          email: email,
          password: password
        }
      )

      // If request is succesful
      if (!result.ok) {
        newValidationState.overall = "Something went wrong...";

        if (result.response.message === "User already exists") {
          newValidationState.overall = "This user already exists"
        }

        console.log(result)
      } else {
        // Response is succesful, handle response data
        if (!isAuthor) {
          // Not an author, try logging in and navigate to home page
          const loginResult = await FetchHelper.user.login({
            email: email,
            password: password
          })

          console.log("Result")
          console.log(loginResult)
          if (loginResult.response.status === "error") {
            newValidationState.overall = "Something went wrong...";
          } else {
            await loginLocal(loginResult.response)
            onRegisterSuccess();
          }

        } else {
          // Wants to be an author, log in, create author profile, and refresh access token
          const loginResult = await FetchHelper.user.login({
            email: email,
            password: password
          })
          const loginResponse = loginResult.response;
          // Logged user in, try creating profile
          if (!loginResult.ok) {
            newValidationState.overall = "Something went wrong...";
          } else {
            await loginLocal(loginResponse)
            // Create profile with logged in information, token must be passed in directly, instead of fetching localStorage, due to a delay
            const createProfileResult = await FetchHelper.profile.create({
              user_id: loginResponse.userId,
              email: loginResponse.email,
              username: loginResponse.username
            }, loginResponse.accessToken)

            console.log("Profile creation result:", createProfileResult);

            if (createProfileResult.ok) {

              localStorage.setItem("authorId", createProfileResult.response.id)
              console.log("Set authorId:", createProfileResult.response.id);

              // Created profile, refresh user token in the localStorage, and then move to home page
              const refreshTokenResult = await FetchHelper.user.refresh({}, loginResponse.refreshToken)
              console.log("Refresh token result:", refreshTokenResult);

              if (refreshTokenResult.ok) {
                localStorage.setItem("accessToken", refreshTokenResult.response.accessToken)

                // Clear the session to force a fresh login
                localStorage.removeItem("accessToken");
                localStorage.removeItem("authorId");

                alert("Registration successful! Please log in to continue.");
                onLogin(); // Go back to login screen
              }
            }
          }
        }
      }
    } else {
      newValidationState.overall = "Something went wrong...";
    }

    setValidationState(newValidationState);
  }

  return (
    <div className="auth-root signup-root">
      <div className={`auth-container auth-container-signup ${isAuthor ? 'author-mode' : ''}`}
        style={{ minHeight: "100vh" }}>
        <LogoCard />
        <h1 className="title">Welcome</h1>
        <p className="subtitle">Sign up to get started</p>

        <input className="input" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <div className="error-message">{validationState.username != "valid" ? validationState.username.map((e) => <div>{e}</div>) : ""}</div>

        <input className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <div className="error-message">{validationState.email != "valid" ? validationState.email : ""}</div>

        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 10 }}>
          <input className="input" type={visibility ? undefined : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
            style={{ width: 283 }} />
          <Icon style={{ marginTop: 10 }} onClick={() => setVisibility(!visibility)}>
            {visibility ? <Visibility /> : <VisibilityOff />}
          </Icon>
        </div>
        <div className="error-message">{validationState.password != "valid" ? validationState.password.map((e) => <div>{e}</div>) : ""}</div>

        <div className="checkbox-row" onClick={() => setIsAuthor(!isAuthor)} style={{ cursor: 'pointer' }}>
          <div className={`checkbox ${isAuthor ? 'checked' : ''}`}>{isAuthor && <div className="tick" />}</div>
          <div style={{ color: '#fff' }}>I want to be an author</div>
        </div>

        {/*isAuthor && (
          <>
            <div className="small-label">Author biography</div>
            <textarea className="input textarea" placeholder="Short biography (min 20 characters)" />

            <div className="small-label">Genres (comma separated)</div>
            <input className="input" placeholder="e.g. Fantasy, Sci-fi, Drama" />
            <div className="note">Separate multiple genres with commas. At least one genre is recommended.</div>
          </>
        )*/}

        <button className="cta" onClick={handleRegister} style={{ marginTop: 18 }}>{
          registerCall.state === "pending" ?
            <ClipLoader color="white" size={20} /> : "Sign up"
        }
        </button>
        <div className="error-message">{validationState.overall != "valid" ? validationState.overall : ""}</div>

        <button style={{ marginBottom: 50 }} className="link" onClick={onLogin}>Already have an account? Log in</button>
      </div>
    </div>
  );
}