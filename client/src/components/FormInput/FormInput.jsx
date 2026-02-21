import { useId } from "react";
import styles from "./FormInput.module.css";

function FormInput({
  type,
  value,
  onChange,
  label,
  autoComplete = "on",
  required,
}) {
  const id = useId();

  return (
    <div className={styles.primaryContainer}>
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
