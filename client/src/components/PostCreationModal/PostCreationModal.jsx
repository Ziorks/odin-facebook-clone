import { useState, useContext } from "react";
import useApiPrivate from "../../hooks/useApiPrivate";
import AuthContext from "../../contexts/AuthContext";
import { MAX_UPLOAD_SIZE_POST } from "../../utils/constants";
import Modal from "../Modal";
import TextAndImageForm from "../TextAndImageForm";
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

    formData.append("wallId", wallId);
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
      .post("/posts", formData)
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
    <Modal handleClose={handleClose}>
      <h2>Create Post</h2>
      <div>
        <img src={auth.user.profile.avatar} className={styles.avatar} />
        <span>{auth.user.username}</span>
      </div>
      <div>
        <label htmlFor="new-post-privacy">Privacy</label>
        <select
          name="new-post-privacy"
          id="new-post-privacy"
          value={privacy}
          onChange={(e) => setPrivacy(e.target.value)}
        >
          <option value="PUBLIC">Public</option>
          <option value="FRIENDS_ONLY">Friends only</option>
          <option value="PRIVATE">Private</option>
        </select>
      </div>
      <TextAndImageForm
        handleSubmit={handleSubmit}
        placeholderText={`What's on your mind, ${auth.user.username}`}
        charLimit={2000}
        maxFilesize={MAX_UPLOAD_SIZE_POST}
      />
      {isLoading && <p>Posting...</p>}
      {errors && (
        <ul>
          {errors.map((error, i) => (
            <li key={i}>{error.msg}</li>
          ))}
        </ul>
      )}
    </Modal>
  );
}

export default PostCreationModal;
