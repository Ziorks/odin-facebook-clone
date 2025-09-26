// import styles from "./Oauth.module.css";
import { useEffect, useContext, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthContext from "../../contexts/AuthContext";
import api from "../../api";
import axios from "axios";

function Oauth() {
  const [error, setError] = useState(false);
  const [searchParams] = useSearchParams();
  const { setAuthFromResponse } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();
    const oauthToken = searchParams.get("token");
    if (!oauthToken) {
      navigate("/", { replace: true });
    }

    api
      .post(
        "/auth/oauth-token-exchange",
        { oauthToken },
        { withCredentials: true, signal: controller.signal },
      )
      .then((res) => {
        setAuthFromResponse(res);
        navigate("/", { replace: true });
      })
      .catch((err) => {
        if (!axios.isCancel(err)) {
          setError(true);
          console.error("oauth login failed", err);
        }
      });

    return () => {
      controller.abort();
    };
  }, [searchParams, setAuthFromResponse, navigate]);

  return (
    <>
      {error ? (
        <p>
          OAuth login failed. Check console for details. Click here to go{" "}
          <Link to={"/"}>back</Link>.
        </p>
      ) : (
        <p>Signing you in...</p>
      )}
    </>
  );
}

export default Oauth;
