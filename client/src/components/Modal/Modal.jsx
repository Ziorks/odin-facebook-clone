import { useEffect } from "react";
import { IoCloseOutline } from "react-icons/io5";
import styles from "./Modal.module.css";

function Modal({ children, heading, handleClose }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "unset";
    };
  });

  return (
    <div
      className={styles.modal}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose?.();
        }
      }}
    >
      <div className={styles.modalContent}>
        <button
          type="button"
          className={styles.close}
          onClick={() => handleClose?.()}
        >
          <IoCloseOutline />
        </button>
        {heading && <h2 className={styles.header}>{heading}</h2>}
        {children}
      </div>
    </div>
  );
}

export default Modal;
