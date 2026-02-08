import { useState, useRef, useEffect } from "react";
import { BsEmojiSmileFill } from "react-icons/bs";
import { AiOutlinePicture } from "react-icons/ai";
import { PiGifFill } from "react-icons/pi";
import { LuSendHorizontal } from "react-icons/lu";
import EmojiPicker from "../EmojiPicker";
import ImagePreview from "../ImagePreview";
import GifSearch from "../GifSearch";
import styles from "./TextAndImageForm.module.css";

const POPUPS = { NONE: "NONE", EMOJI: "EMOJI", GIF: "GIF" };

function TextAndImageForm({
  content: initialContent,
  imageUrl,
  setInputRef,
  placeholderText,
  handleSubmit,
  imageInputId,
  charLimit,
  disableClearOnSubmit,
}) {
  const [content, setContent] = useState(initialContent ?? "");
  const [activePopup, setActivePopup] = useState(POPUPS.NONE);
  const [image, setImage] = useState({
    file: null,
    previewURL: imageUrl ?? null,
  });
  const formRef = useRef();
  const inputRef = useRef();

  useEffect(() => {
    inputRef.current.style.height = "auto";
    inputRef.current.style.height = inputRef.current.scrollHeight + "px";
  }, [content]);

  const contentTrimmed = content.trim();
  const isOverCharLimit = charLimit && contentTrimmed.length > charLimit;

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

  const onSubmit = (e) => {
    e.preventDefault();
    closePopups();
    handleSubmit?.(contentTrimmed, image.file, image.previewURL);

    if (disableClearOnSubmit) return;
    setContent("");
    removeImage();
  };

  return (
    <>
      <form className={styles.form} ref={formRef} onSubmit={onSubmit}>
        <textarea
          className={styles.input}
          rows={1}
          ref={(el) => {
            setInputRef?.(el);
            inputRef.current = el;
          }}
          placeholder={placeholderText}
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
          {charLimit && (
            <div>
              <span style={isOverCharLimit ? { color: "red" } : undefined}>
                {contentTrimmed.length}
              </span>
              /{charLimit}
            </div>
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
                disabled={
                  (!contentTrimmed && !image.previewURL) || isOverCharLimit
                }
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

export default TextAndImageForm;
