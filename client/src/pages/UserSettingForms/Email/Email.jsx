import { useState, useContext } from "react";
import { useOutletContext } from "react-router-dom";
import useRefreshToken from "../../../hooks/useRefreshToken";
import AuthContext from "../../../contexts/AuthContext";
import AboutForm from "../../../components/AboutForm";
// import styles from "./Email.module.css";

function Email() {
  const refresh = useRefreshToken();
  const { closeModal, changesMade, setChangesMade } = useOutletContext();
  const { auth } = useContext(AuthContext);
  const [email, setEmail] = useState(auth.user.email || "");

  return (
    <AboutForm
      method={"PUT"}
      url={`/users/${auth.user.id}`}
      data={{ email }}
      refetch={refresh}
      handleClose={closeModal}
      disableSave={!changesMade}
    >
      <h2>{auth.user.email ? "Update" : "Add an"} Email</h2>
      <div>
        <label htmlFor="email">Email: </label>
        <input
          type="email"
          name="email"
          id="email"
          onChange={(e) => {
            setEmail(e.target.value);
            if (!changesMade) setChangesMade(true);
          }}
          value={email}
        />
      </div>
    </AboutForm>
  );
}

export default Email;
