import { useState, useRef, useEffect } from "react";
import { BsEmojiSmileFill } from "react-icons/bs";
import { AiOutlinePicture } from "react-icons/ai";
import { PiGifFill } from "react-icons/pi";
import { LuSendHorizontal } from "react-icons/lu";
import { formatBytes } from "../../utils/helperFunctions";
import EmojiPicker from "../EmojiPicker";
import ImagePreview from "../ImagePreview";
import GifSearch from "../GifSearch";
import styles from "./TextAndImageForm.module.css";

const POPUPS = { NONE: "NONE", EMOJI: "EMOJI", GIF: "GIF" };

function TextAndImageForm({
  children,
  content: initialContent,
  imageUrl,
  setInputRef,
  placeholderText,
  handleSubmit,
  onChange,
  charLimit,
  maxFilesize,
  disableClearOnSubmit,
  disableSubmit,
}) {
  const [activePopup, setActivePopup] = useState(POPUPS.NONE);
  const [content, setContent] = useState(initialContent ?? "");
  const [image, setImage] = useState({
    file: null,
    previewURL: imageUrl ?? null,
  });
  const formRef = useRef();
  const textInputRef = useRef();
  const imageInputRef = useRef();

  useEffect(() => {
    textInputRef.current.style.height = "auto";
    textInputRef.current.style.height =
      textInputRef.current.scrollHeight + "px";
  }, [content]);

  const contentTrimmed = content.trim();
  const isOverCharLimit = charLimit && contentTrimmed.length > charLimit;

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

  const handleInputChange = (e) => {
    setContent(e.target.value);
    onChange?.();
  };

  const onTextareaKeyDown = (e) => {
    if (e.key === "Enter" && e.shiftKey === false && content.trim()) {
      e.preventDefault();
      formRef.current.requestSubmit();
    }
  };

  const handleEmojiSelect = (emoji) => {
    setContent((prev) => prev + emoji);
    onChange?.();
    closePopups();
  };
  const handleGifSelect = (gif) => {
    setImage({ file: null, previewURL: gif.images.original.webp });
    onChange?.();
    closePopups();
  };
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (maxFilesize && file.size > maxFilesize) {
      return alert(
        `The file you have chosen is too large. The max file size is ${formatBytes(maxFilesize)}.`,
      );
    }
    setImage({
      file,
      previewURL: URL.createObjectURL(file),
    });
    onChange?.();
  };
  const removeImage = () => {
    setImage({ file: null, previewURL: null });
    onChange?.();
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
      <form ref={formRef} onSubmit={onSubmit}>
        {children}
        <div className={styles.inputsContainer}>
          <textarea
            className={styles.input}
            rows={1}
            ref={(el) => {
              setInputRef?.(el);
              textInputRef.current = el;
            }}
            placeholder={placeholderText}
            value={content}
            onChange={handleInputChange}
            onKeyDown={onTextareaKeyDown}
            onFocus={closePopups}
          />
          <input
            hidden
            ref={imageInputRef}
            accept="image/*"
            type="file"
            name="image"
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
                <button
                  className={styles.actionBtn}
                  type="button"
                  onClick={() => {
                    closePopups();
                    imageInputRef.current.click();
                  }}
                >
                  <AiOutlinePicture />
                </button>
              </div>
              <div>
                <button
                  className={`${styles.actionBtn} ${styles.submitBtn}`}
                  type="submit"
                  disabled={
                    (!contentTrimmed && !image.previewURL) ||
                    isOverCharLimit ||
                    disableSubmit
                  }
                >
                  <LuSendHorizontal />
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}

export default TextAndImageForm;
