import { useState, useContext } from "react";
import { useOutletContext } from "react-router-dom";
import useRefreshToken from "../../../hooks/useRefreshToken";
import AuthContext from "../../../contexts/AuthContext";
import AboutForm from "../../../components/AboutForm";
// import styles from "./Password.module.css";

function Password() {
  const refresh = useRefreshToken();
  const { closeModal, changesMade, setChangesMade } = useOutletContext();
  const { auth } = useContext(AuthContext);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  const formData = { oldPassword, newPassword, passwordConfirmation };
  if (!auth.user.password) {
    delete formData.oldPassword;
  }

  return (
    <AboutForm
      method={"PUT"}
      url={`/users/${auth.user.id}`}
      data={formData}
      onSuccess={async () => {
        setChangesMade(false);
        await refresh();
        closeModal();
      }}
      handleClose={closeModal}
      disableSave={!changesMade}
    >
      <h2>{auth.user.password ? "Update" : "Add a"} Password</h2>
      {auth.user.password && (
        <div>
          <label htmlFor="oldPassword">Current Password: </label>
          <input
            type="password"
            name="oldPassword"
            id="oldPassword"
            onChange={(e) => {
              setOldPassword(e.target.value);
              if (!changesMade) setChangesMade(true);
            }}
            value={oldPassword}
          />
        </div>
      )}
      <div>
        <label htmlFor="newPassword">Password: </label>
        <input
          type="password"
          name="newPassword"
          id="newPassword"
          onChange={(e) => {
            setNewPassword(e.target.value);
            if (!changesMade) setChangesMade(true);
          }}
          value={newPassword}
        />
      </div>
      <div>
        <label htmlFor="passwordConfirmation">
          Confirm {auth.user.password && "New"} Password:{" "}
        </label>
        <input
          type="password"
          name="passwordConfirmation"
          id="passwordConfirmation"
          onChange={(e) => {
            setPasswordConfirmation(e.target.value);
            if (!changesMade) setChangesMade(true);
          }}
          value={passwordConfirmation}
        />
      </div>
    </AboutForm>
  );
}

export default Password;
