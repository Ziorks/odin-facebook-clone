import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AuthContext from "../../contexts/AuthContext";
import useApiPrivate from "../../hooks/useApiPrivate";
// import styles from "./Logout.module.css";

function Logout() {
  const api = useApiPrivate();
  const navigate = useNavigate();
  const { clearAuth } = useContext(AuthContext);
  const [error, setError] = useState(null);
  const hasMounted = useRef(false);

  const doLogout = useCallback(() => {
    api
      .post("/auth/logout", {}, { withCredentials: true })
      .then(() => {
        clearAuth();
        navigate("/");
      })
      .catch((err) => {
        if (axios.isCancel(err)) return;

        console.error("logout failed", err);
        setError(err.response?.data?.message || "Something went wrong.");
      });
  }, [api, clearAuth, navigate]);

  useEffect(() => {
    if (hasMounted.current) return;
    hasMounted.current = true;

    doLogout();
  }, [doLogout]);

  return (
    <>
      {error ? (
        <p>
          {error} <button onClick={doLogout}>Try again</button>
        </p>
      ) : (
        <p>Logging you out...</p>
      )}
    </>
  );
}

export default Logout;
