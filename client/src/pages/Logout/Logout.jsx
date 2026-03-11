import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../contexts/AuthContext";
import useApiPrivate from "../../hooks/useApiPrivate";
import LoadingScreen from "../../components/LoadingScreen";
import styles from "./Logout.module.css";

function Logout() {
  const api = useApiPrivate();
  const navigate = useNavigate();
  const { clearAuth } = useContext(AuthContext);
  const [error, setError] = useState(false);
  const hasMounted = useRef(false);

  const doLogout = useCallback(() => {
    setError(false);

    api
      .post("/auth/logout", {}, { withCredentials: true })
      .then(() => {
        clearAuth();
        navigate("/", { replace: true });
      })
      .catch((err) => {
        console.error("logout failed", err);
        setError(true);
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
        <div className={styles.error}>
          <p>Logout failed</p>
          <p>Check console for details</p>
          <button type="button" onClick={doLogout}>
            Try again
          </button>
        </div>
      ) : (
        <LoadingScreen />
      )}
    </>
  );
}

export default Logout;
