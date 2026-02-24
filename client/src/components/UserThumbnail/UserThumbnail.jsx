import { Link } from "react-router-dom";
import styles from "./UserThumbnail.module.css";

function UserThumbnail({ children, user }) {
  return (
    <div className={styles.primaryContainer}>
      <Link to={`/users/${user.id}`}>
        <img src={user.profile.avatar} className={styles.avatar} />
      </Link>
      <div className={styles.infoContainer}>
        <Link to={`/users/${user.id}`} className={styles.usernameLink}>
          <p> {user.username}</p>
        </Link>
        {children}
      </div>
    </div>
  );
}

export default UserThumbnail;
