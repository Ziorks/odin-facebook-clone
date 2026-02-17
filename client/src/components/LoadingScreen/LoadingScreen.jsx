import styles from "./LoadingScreen.module.css";

function LoadingScreen() {
  return (
    <div className={styles.primaryContainer}>
      <div>
        <img src={"/logo.svg"} />
      </div>
      <div>
        <p>from</p>
        <p>Frank</p>
      </div>
    </div>
  );
}

export default LoadingScreen;
