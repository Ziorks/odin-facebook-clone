import { Link } from "react-router-dom";
import ProfilePic from "../ProfilePic";
import styles from "./ProfilePicLink.module.css";

function ProfilePicLink({ to, src, size }) {
  return (
    <Link to={to} className={styles.link}>
      <ProfilePic src={src} size={size} />
    </Link>
  );
}

export default ProfilePicLink;
