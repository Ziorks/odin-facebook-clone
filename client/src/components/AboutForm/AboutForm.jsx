import { useState } from "react";
import useApiPrivate from "../../hooks/useApiPrivate";
import Spinner from "../Spinner";
import styles from "./AboutForm.module.css";

function AboutForm({
  children,
  handleClose,
  onSuccess,
  method,
  url,
  data,
  errMsg,
  loadingMsg,
  disableSave = false,
}) {
  const api = useApiPrivate();
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSaved(false);
    setErrors(null);
    setIsLoading(true);

    api({
      method,
      url,
      data,
    })
      .then(() => {
        setIsSaved(true);
        setIsLoading(false);
        onSuccess?.();
      })
      .catch((err) => {
        console.error(errMsg, err);

        if (err.response?.status === 400) {
          setErrors(err.response.data.errors);
        } else {
          setErrors([
            { msg: err.response?.data?.message || "Something went wrong." },
          ]);
        }
        setIsLoading(false);
      });
  };

  return (
    <>
      {errors && (
        <ul>
          {errors.map((error, i) => (
            <li key={i}>{error.msg}</li>
          ))}
        </ul>
      )}
      <form onSubmit={handleSubmit}>
        {children}
        <div className={styles.actionsContainer}>
          <button type="button" onClick={handleClose}>
            Cancel
          </button>
          <button type="submit" disabled={disableSave || isLoading}>
            {isLoading ? loadingMsg || <Spinner size={16} /> : "Save"}
          </button>
        </div>
        {isSaved && <p className={styles.savedMsg}>Saved!</p>}
      </form>
    </>
  );
}

export default AboutForm;
