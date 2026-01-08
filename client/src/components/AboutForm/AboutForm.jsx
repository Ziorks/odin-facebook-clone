import { useState } from "react";
import useApiPrivate from "../../hooks/useApiPrivate";
// import styles from "./AboutForm.module.css";

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
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors(null);
    setIsLoading(true);

    api({
      method,
      url,
      data,
    })
      .then(() => {
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
      })
      .finally(() => {
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
        <div>
          <button type="button" onClick={handleClose}>
            Cancel
          </button>
          <button type="submit" disabled={disableSave || isLoading}>
            Save
          </button>
          {isLoading && <span>{loadingMsg || "Saving..."}</span>}
        </div>
      </form>
    </>
  );
}

export default AboutForm;
