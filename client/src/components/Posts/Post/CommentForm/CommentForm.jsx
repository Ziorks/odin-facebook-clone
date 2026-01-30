import { useState, useContext } from "react";
import { BsEmojiSmileFill } from "react-icons/bs";
import { AiOutlinePicture } from "react-icons/ai";
import { PiGifFill } from "react-icons/pi";
import { LuSendHorizontal } from "react-icons/lu";
import AuthContext from "../../../../contexts/AuthContext";
import PostContext from "../../../../contexts/PostContext";
import useApiPrivate from "../../../../hooks/useApiPrivate";
import styles from "./CommentForm.module.css";

function CommentForm({ parentComment = null, setInputRef, onSuccess }) {
  const { auth } = useContext(AuthContext);
  const { post } = useContext(PostContext);
  const api = useApiPrivate();

  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState(null);

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors(null);

    api
      .post("/comments", {
        content,
        postId: post.id,
        parentId: parentComment?.id || null,
      })
      .then((resp) => {
        const { comment } = resp.data;
        onSuccess?.(comment);
        setContent("");
      })
      .catch((err) => {
        console.error("comment creation error", err);

        if (err.response?.status === 400) {
          setErrors(err.response.data.errors);
        } else {
          setErrors([
            { msg: err.response?.data?.message || "Something went wrong." },
          ]);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleInputChange = (e) => {
    setErrors(null);
    setContent(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  };

  return (
    <>
      <form className={styles.form} onSubmit={handleCommentSubmit}>
        <textarea
          className={styles.input}
          rows={1}
          ref={setInputRef}
          placeholder={
            parentComment
              ? `Reply to ${parentComment.author.username}`
              : `Comment as ${auth.user.username}`
          }
          value={content}
          onChange={handleInputChange}
        />
        <div className={styles.actionsContainer}>
          <div>
            <button>
              <BsEmojiSmileFill />
            </button>
            <button>
              <AiOutlinePicture />
            </button>
            <button>
              <PiGifFill />
            </button>
          </div>
          <div>
            <button type="submit" disabled={!content || isLoading}>
              <LuSendHorizontal />
            </button>
          </div>
        </div>
      </form>
      {errors && (
        <ul>
          {errors.map((error, i) => (
            <li key={i}>{error.msg}</li>
          ))}
        </ul>
      )}
    </>
  );
}

export default CommentForm;
