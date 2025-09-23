import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Login from "./pages/Login";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      setUser(JSON.parse(user));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  const handleLogin = (user) => {
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
  };

  return (
    <>
      {user ? (
        <Outlet context={{ user, handleLogout }} />
      ) : (
        <Login handleLogin={handleLogin} />
      )}
    </>
  );
}

export default App;
