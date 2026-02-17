import styles from "./Spinner.module.css";

function Spinner({ size }) {
  return (
    <div
      className={styles.spinner}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderWidth: `${size * 0.2}px`,
      }}
    ></div>
  );
}

export default Spinner;
