import { useEffect, useContext, useState, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../../api";
import AuthContext from "../../contexts/AuthContext";
import LoadingScreen from "../../components/LoadingScreen";
import styles from "./Oauth.module.css";

function Oauth() {
  const [searchParams] = useSearchParams();
  const { setAuthFromResponse } = useContext(AuthContext);
  const [error, setError] = useState(false);
  const hasMounted = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (hasMounted.current) return;
    hasMounted.current = true;

    const oauthToken = searchParams.get("token");
    if (!oauthToken) {
      navigate("/", { replace: true });
      return;
    }

    api
      .post(
        "/auth/oauth-token-exchange",
        { oauthToken },
        { withCredentials: true },
      )
      .then((res) => {
        setAuthFromResponse(res);
        navigate("/", { replace: true });
      })
      .catch((err) => {
        console.error("oauth login failed", err);
        setError(true);
      });
  }, [searchParams, setAuthFromResponse, navigate]);

  return (
    <>
      {error ? (
        <div className={styles.error}>
          <p>OAuth login failed. Check console for details.</p>
          <Link to={"/"}>Go back</Link>
        </div>
      ) : (
        <LoadingScreen />
      )}
    </>
  );
}

export default Oauth;
