import { Link } from "react-router-dom";
import styles from "./UserThumbnail.module.css";

function UserThumbnail({ children, user }) {
  return (
    <div className={styles.user_card}>
      <Link to={`/users/${user.id}`} className={styles.user_link}>
        <img src={user.profile.avatar} />
        <p> {user.username}</p>
      </Link>
      {children}
    </div>
  );
}

export default UserThumbnail;
