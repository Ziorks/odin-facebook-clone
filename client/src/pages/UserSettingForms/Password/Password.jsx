import { useState, useContext } from "react";
import { useOutletContext } from "react-router-dom";
import AuthContext from "../../../contexts/AuthContext";
import Modal from "../../../components/Modal";
import AboutForm from "../../../components/AboutForm";
import FormInput from "../../../components/FormInput";

function Password() {
  const { auth } = useContext(AuthContext);
  const { handleSuccess, handleClose, changesMade, makeChange } =
    useOutletContext();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  const formData = { oldPassword, newPassword, passwordConfirmation };
  if (!auth.user.password) {
    delete formData.oldPassword;
  }

  const handleOldPasswordChange = (e) => {
    setOldPassword(e.target.value);
    makeChange();
  };

  const handleNewPasswordChange = (e) => {
    setNewPassword(e.target.value);
    makeChange();
  };

  const handlePasswordConfirmationChange = (e) => {
    setPasswordConfirmation(e.target.value);
    makeChange();
  };

  const inputGap = "1rem";

  return (
    <Modal
      heading={`${auth.user.password ? "Update" : "Add a"} Password`}
      handleClose={handleClose}
    >
      <div style={{ padding: "1rem" }}>
        <AboutForm
          method={"PUT"}
          url={`/users/${auth.user.id}`}
          data={formData}
          onSuccess={handleSuccess}
          handleClose={handleClose}
          disableSave={!changesMade}
        >
          {auth.user.password && (
            <div style={{ marginBottom: inputGap }}>
              <FormInput
                type="password"
                value={oldPassword}
                onChange={handleOldPasswordChange}
                label="Current password"
                autoComplete="off"
                required={true}
              />
            </div>
          )}
          <div style={{ marginBottom: inputGap }}>
            <FormInput
              type="password"
              value={newPassword}
              onChange={handleNewPasswordChange}
              label="New password"
              autoComplete="new-password"
              required={true}
            />
          </div>
          <div style={{ marginBottom: inputGap }}>
            <FormInput
              type="password"
              value={passwordConfirmation}
              onChange={handlePasswordConfirmationChange}
              label="Confirm new password"
              autoComplete="off"
              required={true}
            />
          </div>
        </AboutForm>
      </div>
    </Modal>
  );
}

export default Password;
