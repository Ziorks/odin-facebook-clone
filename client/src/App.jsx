import { useContext } from "react";
import { Outlet, Link } from "react-router-dom";
import AuthContext from "./contexts/AuthContext";
import usePersistLogin from "./hooks/usePersistLogin";
import Login from "./pages/Login";

function App() {
  const { auth } = useContext(AuthContext);
  const isLoading = usePersistLogin();

  console.log(auth);

  return (
    <>
      {isLoading ? (
        <p>Fetching your profile...</p>
      ) : auth?.user ? (
        <>
          <nav>
            <Link to={"/"}>Home</Link>{" "}
            {auth.count.incomingFriendRequests > 0 && (
              <div
                style={{
                  display: "inline-block",
                  width: "5px",
                  height: "5px",
                  borderRadius: "50%",
                  backgroundColor: "red",
                }}
              ></div>
            )}
            <Link to={"/friends"}>Friends</Link>{" "}
            <Link to={"/users"}>User Search</Link>{" "}
            <Link to={`/users/${auth.user.id}`}>My Profile</Link>{" "}
            <Link to={"/settings"}>Settings</Link>{" "}
            <Link to={"/logout"}>Logout</Link>
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
