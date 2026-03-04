import { useState, useContext } from "react";
import { useOutletContext } from "react-router-dom";
import { FaPencil, FaTrashCan } from "react-icons/fa6";
import useApiPrivate from "../../hooks/useApiPrivate";
import AuthContext from "../../contexts/AuthContext";
import Modal from "../Modal";
import Spinner from "../Spinner";
import styles from "./AboutDisplay.module.css";

function AboutDisplay({
  children,
  renderEditForm,
  deleteUrl,
  onDelete,
  deleteErrMsg,
  deleteConfirmMsg,
}) {
  const api = useApiPrivate();
  const { user } = useOutletContext();
  const { auth } = useContext(AuthContext);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = () => {
    setError(null);
    setIsLoading(true);

    api
      .delete(deleteUrl)
      .then(() => {
        onDelete?.();
        setShowDeleteModal(false);
      })
      .catch((err) => {
        console.error(deleteErrMsg || "delete error", err);

        setError(err.response?.data?.message || "Something went wrong.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <>
      {showDeleteModal && (
        <Modal
          heading={"Are you sure?"}
          handleClose={() => setShowDeleteModal(false)}
        >
          <div className={styles.deleteModalContentContainer}>
            {error && (
              <p className={styles.deleteError}>
                An error occured. Please try again.
              </p>
            )}
            <p>
              {deleteConfirmMsg ||
                "Are you sure you want to remove this item from your profile?"}
            </p>
            <div className={styles.deleteActionsContainer}>
              {isLoading ? (
                <p className={styles.deleteLoading}>
                  Deleting
                  <Spinner size={20} />
                </p>
              ) : (
                <>
                  <button onClick={() => setShowDeleteModal(false)}>
                    Cancel
                  </button>
                  <button onClick={handleDelete}>Remove</button>
                </>
              )}
            </div>
          </div>
        </Modal>
      )}
      {showEditForm ? (
        renderEditForm(() => setShowEditForm(false))
      ) : (
        <div className={styles.displayContainer}>
          <div className={styles.displayChildrenContainer}>{children}</div>
          {auth.user.id === user.id && (
            <>
              <button onClick={() => setShowEditForm(true)}>
                <FaPencil />
              </button>
              {deleteUrl && (
                <button onClick={() => setShowDeleteModal(true)}>
                  <FaTrashCan />
                </button>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}

export default AboutDisplay;
