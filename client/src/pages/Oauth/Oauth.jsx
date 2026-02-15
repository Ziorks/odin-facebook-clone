// import styles from "./Oauth.module.css";
import { useEffect, useContext, useState, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../../api";
import AuthContext from "../../contexts/AuthContext";
import LoadingScreen from "../../components/LoadingScreen";

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
        <p>
          OAuth login failed. Check console for details. Click here to go{" "}
          <Link to={"/"}>back</Link>.
        </p>
      ) : (
        <LoadingScreen />
      )}
    </>
  );
}

export default Oauth;
