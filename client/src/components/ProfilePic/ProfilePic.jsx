import styles from "./ProfilePic.module.css";

function ProfilePic({ src, size }) {
  return (
    <div
      className={styles.container}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <img className={styles.image} src={src} />
    </div>
  );
}

export default ProfilePic;
