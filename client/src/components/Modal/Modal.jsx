import styles from "./Modal.module.css";

function Modal({ children, handleClose }) {
  return (
    <div className={styles.modal} onClick={handleClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <span className={styles.close} onClick={handleClose}>
          &times;
        </span>
        {children}
      </div>
    </div>
  );
}

export default Modal;
