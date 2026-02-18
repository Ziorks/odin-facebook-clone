import ProfilePic from "../ProfilePic";
import styles from "./PostPrivacySelect.module.css";

function PostPrivacySelect({ value, avatar, username, onChange }) {
  return (
    <div className={styles.primaryContainer}>
      <ProfilePic src={avatar} size={40} />
      <div>
        <p>{username}</p>
        <select
          value={value}
          onChange={(e) => {
            onChange?.(e);
          }}
        >
          <option value="PUBLIC">Public</option>
          <option value="FRIENDS_ONLY">Friends only</option>
          <option value="PRIVATE">Private</option>
        </select>
      </div>
    </div>
  );
}

export default PostPrivacySelect;
