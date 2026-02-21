import { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import useRefreshToken from "../../hooks/useRefreshToken";
import styles from "./UserSettings.module.css";

function UserSettings() {
  const refresh = useRefreshToken();
  const [changesMade, setChangesMade] = useState(false);
  const navigate = useNavigate();

  const makeChange = () => {
    if (!changesMade) setChangesMade(true);
  };

  const handleClose = ({ force } = {}) => {
    let confirmed = true;
    if (changesMade && !force) {
      confirmed = confirm(
        "You have unsaved changes. Are you sure you want to leave?",
      );
    }
    if (confirmed) {
      navigate(".");
      setChangesMade(false);
    }
  };

  const handleSuccess = async () => {
    try {
      await refresh();
    } finally {
      handleClose({ force: true });
    }
  };

  return (
    <div className={styles.primaryContainer}>
      <h1>Settings</h1>
      <nav>
        <Link to={"avatar"}>Avatar</Link>
        <Link to={"name"}>Name</Link>
        <Link to={"username"}>Username</Link>
        <Link to={"email"}>Email</Link>
        <Link to={"password"}>Password</Link>
      </nav>
      <Outlet
        context={{ handleSuccess, handleClose, changesMade, makeChange }}
      />
    </div>
  );
}

export default UserSettings;
