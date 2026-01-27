import { useState, useContext } from "react";
import AuthContext from "../../contexts/AuthContext";
import useApiPrivate from "../../hooks/useApiPrivate";
import Feed from "../../components/Feed/Feed";
// import styles from "./Home.module.css";

function Home() {
  const { clearAuth } = useContext(AuthContext);
  const api = useApiPrivate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  //TODO: move this
  const handleLogout = () => {
    setIsLoading(true);
    setError(null);

    api
      .post("/auth/logout", {}, { withCredentials: true })
      .then(() => {
        clearAuth();
      })
      .catch((err) => {
        console.error("logout failed", err);
        setError("logout failed");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <>
      <h1>Home Page</h1>
      <button onClick={handleLogout}>Logout</button>
      {isLoading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      <Feed />
    </>
  );
}

export default Home;
