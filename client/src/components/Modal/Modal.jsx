import { useEffect } from "react";
import styles from "./Modal.module.css";

function Modal({ children, handleClose }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "unset";
    };
  });

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
