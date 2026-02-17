import { useEffect } from "react";
import { IoCloseOutline } from "react-icons/io5";
import styles from "./Modal.module.css";

function Modal({ children, header, handleClose }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "unset";
    };
  });

  return (
    <div className={styles.modal} onClick={handleClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button type="button" className={styles.close} onClick={handleClose}>
          <IoCloseOutline />
        </button>
        {header && <h2 className={styles.header}>{header}</h2>}
        {children}
      </div>
    </div>
  );
}

export default Modal;
