import { useContext, useState } from "react";
import api from "../../api";
import AuthContext from "../../contexts/AuthContext";
// import styles from "./Login.module.css";

function SignUpForm() {
  const { setAuthFromResponse } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors(null);
    setIsLoading(true);

    api
      .post(
        "/register",
        { username, password, passwordConfirmation },
        { withCredentials: true },
      )
      .then((res) => {
        setAuthFromResponse(res);
      })
      .catch((err) => {
        console.error("registration error", err);

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
    </>
  );
}

function LoginForm() {
  const { setAuthFromResponse } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    api
      .post("/login", { username, password }, { withCredentials: true })
      .then((res) => {
        setAuthFromResponse(res);
      })
      .catch((err) => {
        console.error("login error", err);
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
    </>
  );
}

function Login() {
  const [showSignUp, setShowSignUp] = useState(false);

  const toggleForm = () => {
    setShowSignUp((prev) => !prev);
  };

  return (
    <>
      {showSignUp ? <SignUpForm /> : <LoginForm />}
      {showSignUp ? (
        <p>
          Already have an account?<a onClick={toggleForm}>Log in</a>
        </p>
      ) : (
        <a onClick={toggleForm}>Sign up for [insert site name]</a>
      )}
    </>
  );
}

export default Login;
