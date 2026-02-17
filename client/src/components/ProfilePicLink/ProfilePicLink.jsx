import { Link } from "react-router-dom";
import ProfilePic from "../ProfilePic";
import styles from "./ProfilePicLink.module.css";

function ProfilePicLink({ to, src, size }) {
  return (
    <Link
      to={to}
      className={styles.link}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <ProfilePic src={src} />
    </Link>
  );
}

export default ProfilePicLink;
