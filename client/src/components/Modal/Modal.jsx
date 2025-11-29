import styles from "./Modal.module.css";

function Modal({ children, handleClose }) {
  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <span className={styles.close} onClick={handleClose}>
          &times;
        </span>
        {children}
      </div>
    </div>
  );
}

export default Modal;
