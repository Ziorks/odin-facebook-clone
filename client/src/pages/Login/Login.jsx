import { useContext, useState } from "react";
import { FaGoogle, FaGithub } from "react-icons/fa";
import api from "../../api";
import AuthContext from "../../contexts/AuthContext";
import FormInput from "../../components/FormInput";
const apiHost = import.meta.env.VITE_API_HOST;
import styles from "./Login.module.css";

function SignUpForm() {
  const { setAuthFromResponse } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
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
        { username, email, password, passwordConfirmation },
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
        <ul className={styles.errorsList}>
          {errors.map((error, i) => (
            <li key={i}>{error.msg}</li>
          ))}
        </ul>
      )}
      <form onSubmit={handleSubmit} className={styles.form}>
        <FormInput
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          label="Username"
          autoComplete="off"
          required={true}
        />
        <FormInput
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          label="Email"
          required={true}
        />
        <FormInput
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          label="Password"
          autoComplete="new-password"
          required={true}
        />
        <FormInput
          type="password"
          value={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
          label="Confirm password"
          autoComplete="off"
          required={true}
        />
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className={styles.signUpBtn}
          >
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
  const [rememberDevice, setRememberDevice] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    api
      .post(
        "/login",
        { username, password, rememberDevice },
        { withCredentials: true },
      )
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
      <form onSubmit={handleLoginSubmit} className={styles.form}>
        <FormInput
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          label="Username or email"
          required={true}
        />
        <FormInput
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          label="Password"
          required={true}
        />
        <div>
          <input
            type="checkbox"
            id="rememberDevice"
            checked={rememberDevice}
            onChange={() => {
              setRememberDevice((prev) => !prev);
            }}
          />
          <label htmlFor="rememberDevice" className={styles.rememberMeLabel}>
            Remember Me
          </label>
        </div>
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className={styles.logInBtn}
          >
            Log In
          </button>
        </div>
      </form>
    </>
  );
}

function GoogleAuth() {
  const handleGoogleAuth = () => {
    window.location.href = `${apiHost}/auth/google`;
  };

  return (
    <button type="button" onClick={handleGoogleAuth}>
      <FaGoogle />
    </button>
  );
}

function GithubAuth() {
  const handleGithubAuth = () => {
    window.location.href = `${apiHost}/auth/github`;
  };

  return (
    <button type="button" onClick={handleGithubAuth}>
      <FaGithub />
    </button>
  );
}

function DemoLogin() {
  const { setAuthFromResponse } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDemoLogin = () => {
    setError(null);
    setIsLoading(true);

    api
      .get("/auth/guest", { withCredentials: true })
      .then((res) => {
        setAuthFromResponse(res);
      })
      .catch((err) => {
        console.error("demo account login error", err);

        setError(err.response?.data?.message || "Something went wrong.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <>
      <button type="button" onClick={handleDemoLogin} disabled={isLoading}>
        Demo account
      </button>
      {error && <span>{error}</span>}
    </>
  );
}

function Login() {
  const [showSignUp, setShowSignUp] = useState(false);

  const toggleForm = () => {
    setShowSignUp((prev) => !prev);
  };

  return (
    <div className={styles.primaryLayout}>
      <div className={styles.hero}>
        <div className={styles.title}>
          <p>legally distinct social network app</p>
          <h1>headlog</h1>
        </div>
        <h2 className={styles.flavorText}>
          Waste your time and get addicted to endless content on Headlog.
        </h2>
      </div>
      <div className={styles.actionsContainer}>
        {showSignUp ? (
          <>
            <SignUpForm />
            <button
              type="button"
              onClick={toggleForm}
              className={styles.toLoginFormBtn}
            >
              Already have an account?
            </button>
          </>
        ) : (
          <>
            <LoginForm />
            <div className={styles.divider}>
              <span>Or continue with</span>
            </div>
            <div className={styles.alternateLoginsContainer}>
              <div className={styles.oauthContainer}>
                <GithubAuth />
                <GoogleAuth />
              </div>
              <div className={styles.demoContainer}>
                <DemoLogin />
              </div>
            </div>
            <div className={styles.divider} />
            <button
              type="button"
              onClick={toggleForm}
              className={styles.newAccountBtn}
            >
              Create new account
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default Login;
