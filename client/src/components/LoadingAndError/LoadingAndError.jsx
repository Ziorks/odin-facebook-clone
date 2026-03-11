import Spinner from "../Spinner";
import styles from "./LoadingAndError.module.css";

function LoadingAndError({ isLoading, error, spinnerSize = 75, onTryAgain }) {
  return (
    <>
      {isLoading && (
        <div className={styles.loading}>
          <Spinner size={spinnerSize} />
        </div>
      )}
      {error && (
        <p className={styles.error}>
          An error occured.
          {onTryAgain && <button onClick={onTryAgain}>Try again</button>}
        </p>
      )}
    </>
  );
}

export default LoadingAndError;
