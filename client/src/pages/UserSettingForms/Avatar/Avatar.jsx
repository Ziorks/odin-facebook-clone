import { useState, useContext, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import { formatBytes } from "../../../utils/helperFunctions";
import AuthContext from "../../../contexts/AuthContext";
import Modal from "../../../components/Modal";
import AboutForm from "../../../components/AboutForm";
import ProfilePic from "../../../components/ProfilePic";
import styles from "./Avatar.module.css";

const maxFilesize = 1024 * 1024 * 2;

function Avatar() {
  const { auth } = useContext(AuthContext);
  const { handleSuccess, handleClose, changesMade, makeChange } =
    useOutletContext();

  const [avatar, setAvatar] = useState({
    file: null,
    previewURL: auth.user.profile.avatar,
  });
  const inputRef = useRef();

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file.size > maxFilesize) {
      return alert(
        `The file you have chosen is too large. The max file size is ${formatBytes(maxFilesize)}.`,
      );
    }
    setAvatar({
      file,
      previewURL: URL.createObjectURL(file),
    });
    makeChange();
  };

  const formData = new FormData();
  formData.append("avatar", avatar.file);

  return (
    <Modal heading={"Update Avatar"} handleClose={handleClose}>
      <div style={{ padding: "1rem" }}>
        <AboutForm
          method={"PUT"}
          url={`/users/${auth.user.id}`}
          data={formData}
          onSuccess={handleSuccess}
          handleClose={handleClose}
          disableSave={!changesMade}
        >
          <div className={styles.inputContainer}>
            <input
              ref={inputRef}
              hidden
              accept="image/*"
              type="file"
              onChange={handleFileInputChange}
            />
            <ProfilePic src={avatar.previewURL} size={100} />
            <button
              className={styles.uploadBtn}
              type="button"
              onClick={() => inputRef.current.click()}
            >
              Upload image
            </button>
          </div>
        </AboutForm>
      </div>
    </Modal>
  );
}

export default Avatar;
