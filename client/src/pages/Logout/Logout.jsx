import { useCallback, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../contexts/AuthContext";
// import styles from "./Logout.module.css";

function Logout() {
  const navigate = useNavigate();
  const { logout, logoutError } = useContext(AuthContext);
  const hasMounted = useRef(false);

  const doLogout = useCallback(() => {
    logout(() => {
      navigate("/");
    });
  }, [logout, navigate]);

  useEffect(() => {
    if (hasMounted.current) return;
    hasMounted.current = true;

    doLogout();
  }, [doLogout]);

  return (
    <>
      {logoutError ? (
        <p>
          {logoutError} <button onClick={doLogout}>Try again</button>
        </p>
      ) : (
        <p>Logging you out...</p>
      )}
    </>
  );
}

export default Logout;
