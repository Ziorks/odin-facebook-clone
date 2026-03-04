import { useId } from "react";
import styles from "./FormInput.module.css";

function FormInput({
  children,
  type,
  value,
  onChange,
  label,
  autoComplete = "on",
  required,
  maxLength,
}) {
  const id = useId();

  if (type === "textarea") {
    return (
      <div className={styles.textlikeContainer}>
        <label htmlFor={id}>{label}</label>
        <textarea
          id={id}
          onChange={onChange}
          value={value}
          autoComplete={autoComplete}
          placeholder={label}
          required={!!required}
          maxLength={maxLength}
          rows={3}
        />
      </div>
    );
  }

  if (type === "select") {
    return (
      <select
        className={styles.select}
        id={id}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        required={!!required}
      >
        {children}
      </select>
    );
  }

  if (type === "checkbox") {
    return (
      <div className={styles.checkboxContainer}>
        <label htmlFor={id}>
          <input type="checkbox" id={id} checked={value} onChange={onChange} />
          {label}
        </label>
      </div>
    );
  }

  return (
    <div className={styles.textlikeContainer}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        onChange={onChange}
        value={value}
        autoComplete={autoComplete}
        placeholder={label}
        required={!!required}
      />
    </div>
  );
}

export default FormInput;
