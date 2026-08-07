import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { apiUrl } from "../../lib/apiBaseUrl.js";
import "./styles.css";

function Login({ loggedInUser, setLoggedInUser }) {
  const [loginForm, setLoginForm] = useState({ user_name: "", password: "" }); 
  //starts by being blank
  //gets the details from the schema
  const [register, setRegister] = useState({
    user_name: "",
    password: "",
  });

  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState("");
    // go back to the previous state
  const redirectTo = location.state?.from || null;

  useEffect(() => {
    if (loggedInUser) {
      navigate("/", { replace: true }); }
  }, [loggedInUser, navigate]);

  if (loggedInUser) {
    return null;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
        const res = await fetch(apiUrl('/admin/login'), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(loginForm),
        });

        const data = await res.json(); //reads the fetched data

        if (!res.ok) {
            const message = typeof data === "string"
            ? data : data?.error || "Login failed";
            setError(message); // backend sends string
            return; //stop the login attempt
        }

        setLoggedInUser(data);

        // navigates through user
        navigate(redirectTo || `/users/${data._id}`);

  } catch (err) {
    console.log(err);
    setError("Login failed");
  }
};

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(apiUrl('/user'), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(register),
      });

      if (!res.ok) {//awaits the fetch
        const msg = await res.text();
        throw new Error(msg); //throw an error if needed
      }
        //
      const loginRes = await fetch(apiUrl('/admin/login'), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
            user_name: register.user_name,
            password: register.password,
        }),
      });

    const user = await loginRes.json();

    if (!loginRes.ok) {
      throw new Error("Auto login failed");
    }

    setLoggedInUser(user);
    navigate(`/users/${data._id}`);

  } catch (err) {
    setError(err.message);
  }
};

  return (
  <div className="login-page">
    <div className="login-card">

      <h1>Sign in</h1>
      <p className="subtitle">
        Welcome to the site, feel free to login or just continue to play the 
        game! If you login, we will keep track of your high scores! Keep in mind, I
        will not take an email address, and thus, you must remember your own user name
        and password.
      </p>

      {/* Login form*/}
      <form onSubmit={handleLogin}>
        <input
          className="input"
          placeholder="Login Name"
          value = {loginForm.user_name}
          onChange={e => setLoginForm({ ...loginForm, user_name: e.target.value })}
        />
        <input
          className="input"
          type="password"
          placeholder="Password"
          value = {loginForm.password}
          onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
          /* Waits to listen for an input to login */
        />
        {/* Sends through the inputted strings to login */}
        <button className="login-btn" type="submit">
          Sign In
        </button>
      </form>

      {/* Text to switch to registration */}
      <p className="switch-text">
        Don’t have an account? Create one below.
      </p>

      {/* Register form */}
      <form className="register-section" onSubmit={handleRegister}>
        {Object.keys(register).map((key) => (
          <input /* Loops through fields to describe new user information */
            key={key}
            className="input"
            type={key === "password" ? "password" : "text"} //adds in password protection on registration
            placeholder={key.replace("_", " ")}
            value = {register[key]}
            onChange={e => setRegister({ ...register, [key]: e.target.value })}
          />
        ))}
            {/* sends through an the regisration of a new user */}
        <button className="register-btn" onClick={handleRegister}>
          Register
        </button>
      </form>

      {error && <p className="error">{error}</p>}
    </div>
  </div>
);
}

export default Login;