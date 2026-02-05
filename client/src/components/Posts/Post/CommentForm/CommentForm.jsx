import { useState, useContext, useRef, useEffect } from "react";
import { BsEmojiSmileFill } from "react-icons/bs";
import { AiOutlinePicture } from "react-icons/ai";
import { PiGifFill } from "react-icons/pi";
import { LuSendHorizontal } from "react-icons/lu";
import AuthContext from "../../../../contexts/AuthContext";
import PostContext from "../../../../contexts/PostContext";
import useApiPrivate from "../../../../hooks/useApiPrivate";
import EmojiPicker from "../../../EmojiPicker";
import ImagePreview from "../../../ImagePreview";
import GifSearch from "../../../GifSearch";
import styles from "./CommentForm.module.css";

const POPUPS = { NONE: "NONE", EMOJI: "EMOJI", GIF: "GIF" };

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
  const [activePopup, setActivePopup] = useState(POPUPS.NONE);
  const [image, setImage] = useState({
    file: null,
    previewURL: null,
  });
  const formRef = useRef();
  const inputRef = useRef();

  const handleCommentSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append("postId", post.id);
    if (parentComment?.id) {
      formData.append("parentId", parentComment.id);
    }
    if (content) {
      formData.append("content", content);
    }
    if (image.file) {
      formData.append("image", image.file);
    } else if (image.previewURL) {
      formData.append("imageUrl", image.previewURL);
    }

    const pendingId = pendingIdCounterRef.current++;
    const pendingComment = {
      author: auth.user,
      pendingId,
    };

    formData.entries().forEach((entry) => {
      const [key, value] = entry;
      if (key === "image") return (pendingComment[key] = image.previewURL);
      pendingComment[key] = +value || value;
    });

    setContent("");
    closePopups();
    removeImage();
    onSubmit?.(pendingComment);

    api
      .post("/comments", formData)
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

  const closePopups = () => {
    setActivePopup(POPUPS.NONE);
  };
  const toggleGifSelect = () => {
    setActivePopup((prev) => (prev === POPUPS.GIF ? POPUPS.NONE : POPUPS.GIF));
  };
  const toggleEmojiSelect = () => {
    setActivePopup((prev) =>
      prev === POPUPS.EMOJI ? POPUPS.NONE : POPUPS.EMOJI,
    );
  };

  const handleEmojiSelect = (emoji) => {
    setContent((prev) => prev + emoji);
    closePopups();
  };
  const handleGifSelect = (gif) => {
    setImage({ file: null, previewURL: gif.images.original.webp });
    closePopups();
  };
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setImage({
      file,
      previewURL: URL.createObjectURL(file),
    });
  };
  const removeImage = () => {
    setImage({ file: null, previewURL: null });
  };

  const imageInputId = `image-upload_${post.id}_${parentComment?.id || "x"}`;

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
          onFocus={closePopups}
        />
        <input
          hidden
          accept="image/*"
          type="file"
          name="image"
          id={imageInputId}
          onChange={handleImageUpload}
        />
        <div className={styles.bottom}>
          {image.previewURL && (
            <ImagePreview
              imageUrl={image.previewURL}
              handleRemove={removeImage}
            />
          )}
          <div className={styles.actionsContainer}>
            <div>
              <span className={styles.relative}>
                {activePopup === POPUPS.EMOJI && (
                  <EmojiPicker onSelect={handleEmojiSelect} />
                )}
                <button
                  className={styles.actionBtn}
                  type="button"
                  onClick={toggleEmojiSelect}
                >
                  <BsEmojiSmileFill />
                </button>
              </span>
              <span className={styles.relative}>
                {activePopup === POPUPS.GIF && (
                  <GifSearch onSelect={handleGifSelect} />
                )}
                <button
                  className={styles.actionBtn}
                  type="button"
                  onClick={toggleGifSelect}
                >
                  <PiGifFill />
                </button>
              </span>
              <label
                htmlFor={imageInputId}
                className={styles.actionBtn}
                onClick={closePopups}
              >
                <AiOutlinePicture />
              </label>
            </div>
            <div>
              <button
                className={styles.actionBtn}
                type="submit"
                disabled={!content.trim() && !image.previewURL}
              >
                <LuSendHorizontal />
              </button>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}

export default CommentForm;
