import { useState } from "react";

function useLocalStorage(localStorageKey, defaultValue) {
  const [value, setValueState] = useState(() => {
    const storedValue = localStorage.getItem(localStorageKey);
    if (storedValue !== null) return storedValue;

    localStorage.setItem(localStorageKey, defaultValue);
    return defaultValue;
  });

  const setValue = (newValue) => {
    setValueState((prev) => {
      const result = typeof newValue === "function" ? newValue(prev) : newValue;
      localStorage.setItem(localStorageKey, result);
      return result;
    });
  };

  return [value, setValue];
}

export default useLocalStorage;
