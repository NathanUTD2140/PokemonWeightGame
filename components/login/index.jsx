import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../../lib/apiBaseUrl.js";
import "./styles.css";

function login({ setLoggedInUser }) {
  const [login, setLogin] = useState({ login_name: "", password: "" }); 
  //starts by being blank
  //gets the details from the schema
  const [register, setRegister] = useState({
    login_name: "",
    password: "",
    first_name: "",
    last_name: "",
    location: "",
    description: "",
    occupation: "",
  });

  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState("");

  if (loggedInUser) {
    navigate("/", { replace: true });
    return null;
  }

  // go back to the previous state
  const redirectTo = location.state?.from || null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
        const res = await fetch(apiUrl('/admin/login'), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(login),
        });

        const data = await res.json(); //reads the fetched data

        if (!res.ok) {
            const message = typeof data === "string"
            ? data : data?.error || "Login failed"
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
            login_name: register.login_name,
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
      <input
        className="input"
        placeholder="Login Name"
        value = {login.login_name}
        onChange={e => setLogin({ ...login, login_name: e.target.value })}
      />
      <input
        className="input"
        type="password"
        placeholder="Password"
        value = {login.password}
        onChange={e => setLogin({ ...login, password: e.target.value })}
        /* Waits to listen for an input to login */
      />
        {/* Sends through the inputted strings to login */}
      <button className="login-btn" onClick={handleLogin}>
        Sign In
      </button>

      {/* Text to switch to registration */}
      <p className="switch-text">
        Don’t have an account? Create one below.
      </p>

      {/* Register form */}
      <form className="register-section" onSubmit={handelRegister}>
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

export default login;