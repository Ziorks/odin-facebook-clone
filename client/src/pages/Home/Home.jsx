import { useState, useContext } from "react";
import AuthContext from "../../contexts/AuthContext";
import useApiPrivate from "../../hooks/useApiPrivate";
// import styles from "./Home.module.css";

function Home() {
  const { clearAuth } = useContext(AuthContext);
  const api = useApiPrivate();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogout = () => {
    setIsLoading(true);
    api
      .post("/logout", {}, { withCredentials: true })
      .then(() => {
        clearAuth();
      })
      .catch((err) => {
        console.error("logout failed", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleApiTest = () => {
    setData(null);
    setError(null);
    setIsLoading(true);
    api
      .get("/test")
      .then((res) => {
        setData(res.data.message);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "an error occured");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <>
      <h1>Home Page</h1>
      <button onClick={handleLogout}>Logout</button>
      <button onClick={handleApiTest}>Test Api Auth</button>
      {isLoading && <p>Loading...</p>}
      {data && <p>api response: {data}</p>}
      {error && <p>{error}</p>}
    </>
  );
}

export default Home;
