import { useState, useContext } from "react";
import { useOutletContext } from "react-router-dom";
import AuthContext from "../../../contexts/AuthContext";
import Modal from "../../../components/Modal";
import AboutForm from "../../../components/AboutForm";
import FormInput from "../../../components/FormInput";

function Name() {
  const { auth } = useContext(AuthContext);
  const { handleSuccess, handleClose, changesMade, makeChange } =
    useOutletContext();

  const [firstName, setFirstName] = useState(auth.user.profile.firstName || "");
  const [lastName, setLastName] = useState(auth.user.profile.lastName || "");

  const handleFirstNameChange = (e) => {
    setFirstName(e.target.value);
    makeChange();
  };

  const handleLastNameChange = (e) => {
    setLastName(e.target.value);
    makeChange();
  };

  const inputGap = "1rem";

  return (
    <Modal heading={"Update Name"} handleClose={handleClose}>
      <div style={{ padding: "1rem" }}>
        <AboutForm
          method={"PUT"}
          url={`/users/${auth.user.id}`}
          data={{ firstName, lastName }}
          onSuccess={handleSuccess}
          handleClose={handleClose}
          disableSave={!changesMade}
        >
          <div style={{ marginBottom: inputGap }}>
            <FormInput
              type="text"
              value={firstName}
              onChange={handleFirstNameChange}
              label="First name"
              autoComplete="off"
            />
          </div>
          <div style={{ marginBottom: inputGap }}>
            <FormInput
              type="text"
              value={lastName}
              onChange={handleLastNameChange}
              label="Last name"
              autoComplete="off"
            />
          </div>
        </AboutForm>
      </div>
    </Modal>
  );
}

export default Name;
