import { useState, useContext } from "react";
import { BsEmojiSmileFill } from "react-icons/bs";
import { AiOutlinePicture } from "react-icons/ai";
import { PiGifFill } from "react-icons/pi";
import { LuSendHorizontal } from "react-icons/lu";
import AuthContext from "../../../../contexts/AuthContext";
import PostContext from "../../../../contexts/PostContext";
import useApiPrivate from "../../../../hooks/useApiPrivate";
import styles from "./CommentForm.module.css";

function CommentForm({
  parentComment = null,
  setInputRef,
  onSubmit,
  onError,
  onSuccess,
}) {
  const { auth } = useContext(AuthContext);
  const { post, pendingIdCounterRef } = useContext(PostContext);
  const api = useApiPrivate();

  const [content, setContent] = useState("");

  const handleCommentSubmit = (e) => {
    e.preventDefault();

    const payload = {
      content,
      postId: post.id,
      parentId: parentComment?.id || null,
    };
    const pendingId = pendingIdCounterRef.current++;

    const pendingComment = {
      ...payload,
      author: auth.user,
      pendingId,
    };

    onSubmit?.(pendingComment);

    api
      .post("/comments", payload)
      .then((resp) => {
        const { comment } = resp.data;
        onSuccess?.({ ...comment, pendingId });
        setContent("");
      })
      .catch((err) => {
        console.error("comment creation error", err);
        onError?.(pendingComment, err);
      });
  };

  const handleInputChange = (e) => {
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
            <button type="submit" disabled={!content}>
              <LuSendHorizontal />
            </button>
          </div>
        </div>
      </form>
    </>
  );
}

export default CommentForm;
