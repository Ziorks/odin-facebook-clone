import { useState, useContext } from "react";
import { useOutletContext } from "react-router-dom";
import useRefreshToken from "../../../hooks/useRefreshToken";
import AuthContext from "../../../contexts/AuthContext";
import AboutForm from "../../../components/AboutForm";
// import styles from "./Name.module.css";

function Name() {
  const refresh = useRefreshToken();
  const { closeModal, changesMade, setChangesMade } = useOutletContext();
  const { auth } = useContext(AuthContext);
  const [firstName, setFirstName] = useState(auth.user.profile.firstName || "");
  const [lastName, setLastName] = useState(auth.user.profile.lastName || "");

  return (
    <AboutForm
      method={"PUT"}
      url={`/users/${auth.user.id}`}
      data={{ firstName, lastName }}
      onSuccess={async () => {
        await refresh();
        closeModal();
      }}
      handleClose={closeModal}
      disableSave={!changesMade}
    >
      <h2>Update Name</h2>
      <div>
        <label htmlFor="firstName">First Name: </label>
        <input
          type="text"
          name="firstName"
          id="firstName"
          autoComplete="off"
          onChange={(e) => {
            setFirstName(e.target.value);
            if (!changesMade) setChangesMade(true);
          }}
          value={firstName}
        />
      </div>
      <div>
        <label htmlFor="lastName">Last Name: </label>
        <input
          type="text"
          name="lastName"
          id="lastName"
          autoComplete="off"
          onChange={(e) => {
            setLastName(e.target.value);
            if (!changesMade) setChangesMade(true);
          }}
          value={lastName}
        />
      </div>
    </AboutForm>
  );
}

export default Name;
