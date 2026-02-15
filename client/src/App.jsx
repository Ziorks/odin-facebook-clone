import { useContext } from "react";
import { Outlet } from "react-router-dom";
import AuthContext from "./contexts/AuthContext";
import usePersistLogin from "./hooks/usePersistLogin";
import LoadingScreen from "./components/LoadingScreen";
import SiteNav from "./components/SiteNav";
import Login from "./pages/Login";

function App() {
  const { auth } = useContext(AuthContext);
  const isLoading = usePersistLogin();

  return (
    <>
      {isLoading ? (
        <LoadingScreen />
      ) : auth?.user ? (
        <>
          <SiteNav />
          <Outlet />
        </>
      ) : (
        <Login />
      )}
    </>
  );
}

export default App;
