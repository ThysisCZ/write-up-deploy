import React, { useState } from 'react';
import LogoCard from './LogoCard';
import { ClipLoader } from "react-spinners";
import FetchHelper from '../fetchHelper';

export default function SignUpScreen({ onLogin = () => { }, onRegisterSuccess = () => { }, loginLocal }) {
  const [isAuthor, setIsAuthor] = useState(false);
  const [registerCall, setRegisterCall] = useState({ state: "inactive" });

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [validationState, setValidationState] = useState(
    {
      username:"valid",
      email:"valid",
      password:"valid",
      overall:"valid"
    }
  );


  const handleRegister = async () => {
    // TODO: when backend ready -> fetch('/auth/login', {method:'POST', body: JSON.stringify({email,password})})
    // temporary: simulate loading and success
    var isValid = true
    var newValidationState = {
      username:"valid",
      email:"valid",
      password:[],
      overall:"valid"
    }

    if ( !username ) { isValid = false; newValidationState.username="A username is required"; }
    if ( !email ) { isValid = false; newValidationState.email="An email is required"; }

    if ( password.length < 10 ) { isValid=false; newValidationState.password.push("• Password must be at least 10 characters long") }
    if ( password.toUpperCase() == password ) { isValid=false; newValidationState.password.push("• Password must include lowercase characters") }
    if ( password.toLowerCase() == password ) { isValid=false; newValidationState.password.push("• Password must include uppercase characters") }

    var format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;

    if ( !format.test(password) ) { isValid=false; newValidationState.password.push("• Password must include a special character") }
    
    
    if ( !password ) { isValid = false; newValidationState.password="A password is required"; }

    if (isValid) { newValidationState.password="valid"; }
    
    if (isValid) {
        // Call backend to register user
        const result = await FetchHelper.user.register(
          {
            username: username,
            email: email,
            password: password
          }
        )

        if ( !result.ok ) {
            newValidationState.overall = result.response.message;
        }

        // If request is succesful
        if ( result.ok ) {
          const response = result.response;
          // Response is succesful, handle response data
          if (response.status === "success") {
             
              if (!isAuthor) {
                // Not an author, try logging in and navigate to home page
                const loginResult = await FetchHelper.user.login({
                  email: email,
                  password: password
                })
                
                console.log("Result")
                console.log(loginResult)
                if (loginResult.response.status === "error"){
                  newValidationState.overall = response.message;
                }else{
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

                  newValidationState.overall = loginResponse.message;

                }else{
                  await loginLocal(loginResponse)
                  // Create profile with logged in information, token must be passed in directly, instead of fetching localStorage, due to a delay
                  const createProfileResult = await FetchHelper.profile.create({
                        user_id: loginResponse.userId,
                        email: loginResponse.email,
                        username: loginResponse.username
                  },loginResponse.accessToken)

                  if (createProfileResult.ok) {
                    // Created profile, refresh user token in the localStorage, and then move to home page
                    const refreshTokenResult = await FetchHelper.user.refresh({}, loginResponse.refreshToken)
                    console.log(refreshTokenResult)
                    if (refreshTokenResult.ok) {
                      localStorage.setItem("accessToken",refreshTokenResult.response.accessToken)
                      onRegisterSuccess()
                    }
                  }
                }
              }
          }
          // Error, display response error
          if (response.status === "error") {
            newValidationState.overall = response.message;
          }

        }else{
          if (newValidationState.overall=="valid") newValidationState.overall = "Something went wrong...";
        }
    }else{
        //invalid
    }
    setValidationState(newValidationState)
  }

  return (
    <div className="auth-root signup-root">
      <div className={`auth-container auth-container-signup ${isAuthor ? 'author-mode' : ''}`}
        style={{ minHeight: "100vh" }}>
        <LogoCard />
        <h1 className="title">Welcome</h1>
        <p className="subtitle">Sign up to get started</p>

        <input className="input" placeholder="Username" value={username} onChange={ (e) => setUsername(e.target.value) }/>
        <div className="error-message">{validationState.username != "valid" ? validationState.username : ""}</div>

        <input className="input" placeholder="Email" value={email} onChange={ (e) => setEmail(e.target.value) }/>
        <div className="error-message">{validationState.email != "valid" ? validationState.email : ""}</div>

        <input className="input" type="password" placeholder="Password" value={password} onChange={ (e) => setPassword(e.target.value) }/>
        <div className="error-message">{validationState.password != "valid" ? validationState.password.map( (e)=> <div>{e}</div> ) : ""}</div>

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