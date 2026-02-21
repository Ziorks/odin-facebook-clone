import { useState, useContext } from "react";
import { useOutletContext } from "react-router-dom";
import AuthContext from "../../../contexts/AuthContext";
import Modal from "../../../components/Modal";
import AboutForm from "../../../components/AboutForm";
import FormInput from "../../../components/FormInput";

function Username() {
  const { auth } = useContext(AuthContext);
  const { handleSuccess, handleClose, changesMade, makeChange } =
    useOutletContext();

  const [username, setUsername] = useState(auth.user.username || "");

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    makeChange();
  };

  return (
    <Modal heading={"Update Username"} handleClose={handleClose}>
      <div style={{ padding: "1rem" }}>
        <AboutForm
          method={"PUT"}
          url={`/users/${auth.user.id}`}
          data={{ username }}
          onSuccess={handleSuccess}
          handleClose={handleClose}
          disableSave={!changesMade}
        >
          <div style={{ marginBottom: "1rem" }}>
            <FormInput
              type="text"
              value={username}
              onChange={handleUsernameChange}
              label="Username"
              autoComplete="off"
              required={true}
            />
          </div>
        </AboutForm>
      </div>
    </Modal>
  );
}

export default Username;
