import { useContext } from "react";
import { Outlet } from "react-router-dom";
import AuthContext from "./contexts/AuthContext";
import Login from "./pages/Login";
import usePersistLogin from "./hooks/usePersistLogin";

function App() {
  const { auth } = useContext(AuthContext);
  const isLoading = usePersistLogin();

  return (
    <>{isLoading ? <p>Loading...</p> : auth?.user ? <Outlet /> : <Login />}</>
  );
}

export default App;
