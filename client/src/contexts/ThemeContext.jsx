import { createContext, useEffect } from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import { THEMES } from "../utils/constants";

const systemPreference = window.matchMedia("(prefers-color-scheme: dark)")
  .matches
  ? THEMES.DARK
  : THEMES.LIGHT;

const ThemeContext = createContext({});

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useLocalStorage("theme", systemPreference);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeContext;
