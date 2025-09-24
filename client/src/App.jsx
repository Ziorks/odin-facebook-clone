import { useState, useEffect, useContext } from "react";
import { Outlet } from "react-router-dom";
import AuthContext from "./contexts/AuthContext";
import useRefreshToken from "./hooks/useRefreshToken";
import Login from "./pages/Login";

function App() {
  const { auth } = useContext(AuthContext);
  const refresh = useRefreshToken();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    let isMounted = true;
    const controller = new AbortController();

    refresh(controller.signal).finally(() => {
      if (isMounted) {
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [refresh]);

  return (
    <>
      {isLoading ? (
        <h1>Loading...</h1>
      ) : (
        <>{auth.user ? <Outlet /> : <Login />}</>
      )}
    </>
  );
}

export default App;
