import { useState, useContext } from "react";
import { useOutletContext } from "react-router-dom";
import useRefreshToken from "../../../hooks/useRefreshToken";
import AuthContext from "../../../contexts/AuthContext";
import AboutForm from "../../../components/AboutForm";
import styles from "./Avatar.module.css";

function Avatar() {
  const refresh = useRefreshToken();
  const { closeModal, changesMade, setChangesMade } = useOutletContext();
  const { auth } = useContext(AuthContext);
  const [avatar, setAvatar] = useState({
    file: null,
    previewURL: auth.user.profile.avatar,
  });

  const formData = new FormData();
  formData.append("avatar", avatar.file);

  return (
    <AboutForm
      method={"PUT"}
      url={`/users/${auth.user.id}`}
      data={formData}
      onSuccess={async () => {
        await refresh();
        closeModal();
      }}
      handleClose={closeModal}
      disableSave={!changesMade}
    >
      <h2>Update Avatar</h2>
      <div>
        <img src={avatar.previewURL} style={{ height: "100px" }} />
      </div>
      <div>
        <label htmlFor="avatar" className={styles.uploadBtn}>
          Upload Picture
        </label>
        <input
          hidden
          accept="image/*"
          type="file"
          name="avatar"
          id="avatar"
          onChange={(e) => {
            const file = e.target.files[0];
            setAvatar({
              file,
              previewURL: URL.createObjectURL(file),
            });
            if (!changesMade) setChangesMade(true);
          }}
        />
      </div>
    </AboutForm>
  );
}

export default Avatar;
