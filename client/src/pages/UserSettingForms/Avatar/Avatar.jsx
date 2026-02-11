import { useState, useContext } from "react";
import { useOutletContext } from "react-router-dom";
import useRefreshToken from "../../../hooks/useRefreshToken";
import AuthContext from "../../../contexts/AuthContext";
import AboutForm from "../../../components/AboutForm";
import { formatBytes } from "../../../utils/helperFunctions";
import styles from "./Avatar.module.css";

const maxFilesize = 1024 * 1024 * 2;

function Avatar() {
  const refresh = useRefreshToken();
  const { closeModal, changesMade, setChangesMade } = useOutletContext();
  const { auth } = useContext(AuthContext);
  const [avatar, setAvatar] = useState({
    file: null,
    previewURL: auth.user.profile.avatar,
  });

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
    if (!changesMade) setChangesMade(true);
  };

  const formData = new FormData();
  formData.append("avatar", avatar.file);

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
          onChange={handleFileInputChange}
        />
      </div>
    </AboutForm>
  );
}

export default Avatar;
