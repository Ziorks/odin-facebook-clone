import { useState, useContext } from "react";
import useApiPrivate from "../../hooks/useApiPrivate";
import AuthContext from "../../contexts/AuthContext";
import Modal from "../Modal";
import TextAndImageForm from "../TextAndImageForm";
import styles from "./PostCreationModal.module.css";

function PostCreationModal({ handleClose, wallId, onSuccess }) {
  const { auth } = useContext(AuthContext);
  const api = useApiPrivate();

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState(null);

  const handleSubmit = (content, file, imageUrl) => {
    setIsLoading(true);
    setErrors(null);

    const formData = new FormData();

    formData.append("wallId", wallId);
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
      {/* TODO: consider adding post privacy settings*/}
      <TextAndImageForm
        handleSubmit={handleSubmit}
        placeholderText={`What's on your mind, ${auth.user.username}`}
        imageInputId={"post-image-input"}
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
