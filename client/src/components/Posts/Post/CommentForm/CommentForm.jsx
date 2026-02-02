import { useState, useContext, useRef, useEffect } from "react";
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
  const formRef = useRef();
  const inputRef = useRef();

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

    setContent("");
    onSubmit?.(pendingComment);

    api
      .post("/comments", payload)
      .then((resp) => {
        const { comment } = resp.data;
        onSuccess?.({ ...comment, pendingId });
      })
      .catch((err) => {
        console.error("comment creation error", err);
        onError?.(pendingComment, err);
      });
  };

  useEffect(() => {
    inputRef.current.style.height = "auto";
    inputRef.current.style.height = inputRef.current.scrollHeight + "px";
  }, [content]);

  const handleInputChange = (e) => {
    setContent(e.target.value);
  };

  const onTextareaKeyDown = (e) => {
    if (e.key === "Enter" && e.shiftKey === false && content.trim()) {
      e.preventDefault();
      formRef.current.requestSubmit();
    }
  };

  return (
    <>
      <form
        className={styles.form}
        ref={formRef}
        onSubmit={handleCommentSubmit}
      >
        <textarea
          className={styles.input}
          rows={1}
          ref={(el) => {
            setInputRef?.(el);
            inputRef.current = el;
          }}
          placeholder={
            parentComment
              ? `Reply to ${parentComment.author.username}`
              : `Comment as ${auth.user.username}`
          }
          value={content}
          onChange={handleInputChange}
          onKeyDown={onTextareaKeyDown}
        />
        <div className={styles.actionsContainer}>
          <div>
            <button type="button">
              <BsEmojiSmileFill />
            </button>
            <button type="button">
              <AiOutlinePicture />
            </button>
            <button type="button">
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
