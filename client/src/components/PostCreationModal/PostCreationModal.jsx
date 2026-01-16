import { useState, useContext } from "react";
import useApiPrivate from "../../hooks/useApiPrivate";
import AuthContext from "../../contexts/AuthContext";
import Modal from "../Modal";
import styles from "./PostCreationModal.module.css";

function PostCreationModal({ handleClose, wallId, onSuccess }) {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState(null);
  const api = useApiPrivate();
  const { auth } = useContext(AuthContext);

  const handlePostSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors(null);

    api
      .post("/posts", { content, wallId })
      .then((resp) => {
        onSuccess(resp.data.post);
      })
      .catch((err) => {
        setIsLoading(false);
        console.error("post creation error", err);

        if (err.response?.status === 400) {
          setErrors(err.response.data.errors);
        } else {
          setErrors([
            { msg: err.response?.data?.message || "Something went wrong." },
          ]);
        }
      });
  };

  return (
    <Modal handleClose={handleClose}>
      <h2>Create Post</h2>
      <div>
        <img src={auth.user.profile.avatar} className={styles.avatar} />
        <span>{auth.user.username}</span>
      </div>
      {/* TODO: consider adding post privacy settings*/}
      {errors && (
        <ul>
          {errors.map((error, i) => (
            <li key={i}>{error.msg}</li>
          ))}
        </ul>
      )}
      <form onSubmit={handlePostSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div>
          <button type="submit" disabled={!content || isLoading}>
            Post
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default PostCreationModal;
