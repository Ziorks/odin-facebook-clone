import { useState, useContext } from "react";
import { useOutletContext } from "react-router-dom";
import useApiPrivate from "../../hooks/useApiPrivate";
import AuthContext from "../../contexts/AuthContext";
// import styles from "./AboutDisplay.module.css";

function AboutDisplay({
  children,
  refetch,
  deleteUrl,
  deleteErrMsg,
  deleteConfirmMsg,
  renderEditForm,
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
        refetch();
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
        <Modal handleClose={() => setShowDeleteModal(false)}>
          <p>{deleteConfirmMsg || "Are you sure you want to delete?"}</p>
          <div>
            <button onClick={handleDelete} disabled={isLoading}>
              DELETE
            </button>
            <button
              onClick={() => setShowDeleteModal(false)}
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
          {isLoading && <p>Deleting...</p>}
          {error && <p>An error occured. Please try again.</p>}
        </Modal>
      )}
      {showEditForm ? (
        renderEditForm(() => setShowEditForm(false))
      ) : (
        <div>
          {children}
          {auth.user.id === user.id && (
            <>
              <button onClick={() => setShowEditForm(true)}>Edit</button>
              {deleteUrl && (
                <button onClick={() => setShowDeleteModal(true)}>Delete</button>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}

export default AboutDisplay;
