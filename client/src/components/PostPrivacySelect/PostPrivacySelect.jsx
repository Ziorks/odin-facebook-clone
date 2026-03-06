import ProfilePic from "../ProfilePic";
import FormInput from "../FormInput";
import styles from "./PostPrivacySelect.module.css";

function PostPrivacySelect({ value, avatar, username, onChange }) {
  return (
    <div className={styles.primaryContainer}>
      <ProfilePic src={avatar} size={40} />
      <div>
        <p>{username}</p>
        <FormInput
          type="select"
          value={value}
          onChange={(e) => {
            onChange?.(e);
          }}
        >
          <option value="PUBLIC">Public</option>
          <option value="FRIENDS_ONLY">Friends only</option>
          <option value="PRIVATE">Private</option>
        </FormInput>
      </div>
    </div>
  );
}

export default PostPrivacySelect;
