import { useState, useContext } from "react";
import { useOutletContext } from "react-router-dom";
import useRefreshToken from "../../../hooks/useRefreshToken";
import AuthContext from "../../../contexts/AuthContext";
import AboutForm from "../../../components/AboutForm";
// import styles from "./Username.module.css";

function Username() {
  const refresh = useRefreshToken();
  const { closeModal, changesMade, setChangesMade } = useOutletContext();
  const { auth } = useContext(AuthContext);
  const [username, setUsername] = useState(auth.user.username || "");

  return (
    <AboutForm
      method={"PUT"}
      url={`/users/${auth.user.id}`}
      data={{ username }}
      onSuccess={async () => {
        setChangesMade(false);
        await refresh();
        closeModal();
      }}
      handleClose={closeModal}
      disableSave={!changesMade}
    >
      <h2>Update Username</h2>
      <div>
        <label htmlFor="username">Username: </label>
        <input
          type="text"
          name="username"
          id="username"
          autoComplete="off"
          onChange={(e) => {
            setUsername(e.target.value);
            if (!changesMade) setChangesMade(true);
          }}
          value={username}
        />
      </div>
    </AboutForm>
  );
}

export default Username;
