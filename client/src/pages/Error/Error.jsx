import { Link, useNavigate } from "react-router-dom";
import { SiMariadbfoundation } from "react-icons/si";
import styles from "./Error.module.css";

function Error() {
  const navigate = useNavigate();

  return (
    <div className={styles.primaryContainer}>
      <div className={styles.graphic}>
        <p>?</p>
        <p>?</p>
        <p>?</p>
        <SiMariadbfoundation />
      </div>
      <h1>This Page Isn't Available</h1>
      <Link to={"/"}>Go to Feed</Link>
      <button type="button" onClick={() => navigate(-1)}>
        Go back
      </button>
    </div>
  );
}

export default Error;
