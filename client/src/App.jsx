import { useContext } from "react";
import { Outlet, Link } from "react-router-dom";
import AuthContext from "./contexts/AuthContext";
import Login from "./pages/Login";
import usePersistLogin from "./hooks/usePersistLogin";

function App() {
  const { auth } = useContext(AuthContext);
  const isLoading = usePersistLogin();

  return (
    <>
      {isLoading ? (
        <p>Fetching your profile...</p>
      ) : auth?.user ? (
        <>
          <nav>
            <Link to={"/"}>Home</Link> <Link to={"/friends"}>Friends</Link>{" "}
            <Link to={"/users"}>User Search</Link>{" "}
            <Link to={`/users/${auth.user.id}`}>My Profile</Link>{" "}
            <Link to={"/settings"}>Settings</Link>
          </nav>
          <Outlet />
        </>
      ) : (
        <Login />
      )}
    </>
  );
}

export default App;
