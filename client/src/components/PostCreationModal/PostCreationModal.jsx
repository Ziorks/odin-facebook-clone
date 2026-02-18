import { useState, useContext } from "react";
import useApiPrivate from "../../hooks/useApiPrivate";
import AuthContext from "../../contexts/AuthContext";
import { MAX_UPLOAD_SIZE_POST } from "../../utils/constants";
import Modal from "../Modal";
import TextAndImageForm from "../TextAndImageForm";
import PostPrivacySelect from "../PostPrivacySelect";
import styles from "./PostCreationModal.module.css";

function PostCreationModal({ handleClose, wallId, onSuccess }) {
  const { auth } = useContext(AuthContext);
  const api = useApiPrivate();

  const [privacy, setPrivacy] = useState("PUBLIC");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState(null);

  const handleSubmit = (content, file, imageUrl) => {
    setIsLoading(true);
    setErrors(null);

    const formData = new FormData();

    formData.append("privacy", privacy);
    if (content) {
      formData.append("content", content);
    }
    if (file) {
      formData.append("image", file);
    } else if (imageUrl) {
      formData.append("imageUrl", imageUrl);
    }

    api
      .post(`/users/${wallId}/wall`, formData)
      .then((resp) => {
        const { post } = resp.data;
        onSuccess?.(post);
      })
      .catch((err) => {
        console.error("post creation error", err);

        if (err.response?.status === 400) {
          setErrors(err.response.data.errors);
        } else {
          setErrors([
            { msg: err.response?.data?.message || "Something went wrong." },
          ]);
        }
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <Modal heading={"Create Post"} handleClose={handleClose}>
      <div className={styles.formContainer}>
        <TextAndImageForm
          handleSubmit={handleSubmit}
          placeholderText={`What's on your mind, ${auth.user.username}`}
          charLimit={2000}
          maxFilesize={MAX_UPLOAD_SIZE_POST}
        >
          <PostPrivacySelect
            value={privacy}
            onChange={(e) => setPrivacy(e.target.value)}
            avatar={auth.user.profile.avatar}
            username={auth.user.username}
          />
        </TextAndImageForm>
        {isLoading && <p>Posting...</p>}
        {errors && (
          <ul>
            {errors.map((error, i) => (
              <li key={i}>{error.msg}</li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
}

export default PostCreationModal;
