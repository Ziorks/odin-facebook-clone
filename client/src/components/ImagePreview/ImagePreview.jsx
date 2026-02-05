import styles from "./ImagePreview.module.css";

function ImagePreview({ imageUrl, handleRemove }) {
  return (
    <div className={styles.imagePreview}>
      <span onClick={() => handleRemove?.()}>&times;</span>
      <img src={imageUrl} />
    </div>
  );
}

export default ImagePreview;
