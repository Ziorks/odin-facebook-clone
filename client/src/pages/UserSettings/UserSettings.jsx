import { Link, Outlet } from "react-router-dom";
// import styles from "./UserSettings.module.css";

function UserSettings() {
  return (
    <>
      <h1>User Settings</h1>
      <Outlet />
      <div>
        <Link to={"username"}>Username</Link>
      </div>
      <div>
        <Link to={"email"}>Email</Link>
      </div>
      <div>
        <Link to={"name"}>Name</Link>
      </div>
      <div>
        <Link to={"avatar"}>Avatar</Link>
      </div>
      <div>
        <Link to={"password"}>Password</Link>
      </div>
    </>
  );
}

export default UserSettings;
