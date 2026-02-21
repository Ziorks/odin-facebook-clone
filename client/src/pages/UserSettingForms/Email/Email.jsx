import { useState, useContext } from "react";
import { useOutletContext } from "react-router-dom";
import AuthContext from "../../../contexts/AuthContext";
import Modal from "../../../components/Modal";
import AboutForm from "../../../components/AboutForm";
import FormInput from "../../../components/FormInput";

function Email() {
  const { auth } = useContext(AuthContext);
  const { handleSuccess, handleClose, changesMade, makeChange } =
    useOutletContext();

  const [email, setEmail] = useState(auth.user.email || "");

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    makeChange();
  };

  return (
    <Modal
      heading={`${auth.user.email ? "Update" : "Add an"} Email`}
      handleClose={handleClose}
    >
      <div style={{ padding: "1rem" }}>
        <AboutForm
          method={"PUT"}
          url={`/users/${auth.user.id}`}
          data={{ email }}
          onSuccess={handleSuccess}
          handleClose={handleClose}
          disableSave={!changesMade}
        >
          <div style={{ marginBottom: "1rem" }}>
            <FormInput
              type="email"
              value={email}
              onChange={handleEmailChange}
              label="Email"
              autoComplete="off"
              required={true}
            />
          </div>
        </AboutForm>
      </div>
    </Modal>
  );
}

export default Email;
