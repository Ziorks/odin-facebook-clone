import { useState } from "react";
import axios from "axios";
const host = import.meta.env.VITE_API_HOST;
// import styles from "./Login.module.css";

function SignUpForm({ handleLogin, toggleForm }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors(null);
    setIsLoading(true);

    axios
      .post(`${host}/register`, { username, password, passwordConfirmation })
      .then((res) => {
        const { id, username } = res.data.user;
        const user = { id, username, token: res.data.token };
        handleLogin(user);
      })
      .catch((err) => {
        console.log(err);

        if (err.response?.status === 400) {
          setErrors(err.response.data.errors);
        } else {
          setErrors([
            { msg: err.response?.data?.message || "Something went wrong." },
          ]);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <>
      {isLoading && <p>Processing...</p>}
      {errors && (
        <ul>
          {errors.map((error, i) => (
            <li key={i}>{error.msg}</li>
          ))}
        </ul>
      )}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username: </label>
          <input
            type="text"
            name="username"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password: </label>
          <input
            type="password"
            name="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="passwordConfirmation">Confirm Password: </label>
          <input
            type="password"
            name="passwordConfirmation"
            id="passwordConfirmation"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            required
          />
        </div>
        <div>
          <button type="submit" disabled={isLoading}>
            Sign Up
          </button>
        </div>
      </form>
      <p>
        Already have an account? <a onClick={toggleForm}>Log in</a>
      </p>
    </>
  );
}

function LoginForm({ handleLogin, toggleForm }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    axios
      .post(`${host}/login`, { username, password })
      .then((res) => {
        const { id, username } = res.data.user;
        const user = { id, username, token: res.data.token };
        handleLogin(user);
      })
      .catch((err) => {
        console.log(err);
        setError(err.response?.data?.message || "Something went wrong.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <>
      {isLoading && <p>Processing...</p>}
      {error && <p>{error}</p>}
      <form onSubmit={handleLoginSubmit}>
        <div>
          <label htmlFor="username">Username: </label>
          <input
            type="text"
            name="username"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password: </label>
          <input
            type="password"
            name="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <button type="submit" disabled={isLoading}>
            Login
          </button>
        </div>
      </form>
      <a onClick={toggleForm}>Sign up for [insert site name]</a>
    </>
  );
}

function Login({ handleLogin }) {
  const [showSignUp, setShowSignUp] = useState(false);

  const toggleForm = () => {
    setShowSignUp((prev) => !prev);
  };

  return (
    <>
      {showSignUp ? (
        <SignUpForm handleLogin={handleLogin} toggleForm={toggleForm} />
      ) : (
        <LoginForm handleLogin={handleLogin} toggleForm={toggleForm} />
      )}
    </>
  );
}

export default Login;
