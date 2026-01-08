import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Modal from "../../components/Modal";
// import styles from "./UserSettingsModal.module.css";

function UserSettingsModal() {
  const [changesMade, setChangesMade] = useState(false);
  const navigate = useNavigate();

  const closeModal = () => navigate(".");
  const handleClose = () => {
    let confirmed = true;
    if (changesMade) {
      confirmed = confirm(
        "You have unsaved changes. Are you sure you want to leave?",
      );
    }
    if (confirmed) {
      closeModal();
    }
  };

  return (
    <Modal handleClose={handleClose}>
      <Outlet context={{ closeModal, changesMade, setChangesMade }} />
    </Modal>
  );
}

export default UserSettingsModal;
