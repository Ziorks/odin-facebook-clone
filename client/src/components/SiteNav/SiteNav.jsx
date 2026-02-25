import { useContext, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  IoSearchSharp,
  IoPeople,
  IoChevronDownSharp,
  IoHome,
  IoSettingsSharp,
  IoSunnyOutline,
  IoMoonOutline,
  IoLogOut,
} from "react-icons/io5";
import { THEMES } from "../../utils/constants";
import AuthContext from "../../contexts/AuthContext";
import ThemeContext from "../../contexts/ThemeContext";
import ProfilePic from "../ProfilePic";
import styles from "./SiteNav.module.css";

function SiteNav() {
  const { auth } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);

  const location = useLocation();

  const [showMenu, setShowMenu] = useState(false);

  const dropdownContentRef = useRef();
  const toggleThemeRef = useRef();

  const toggleShowMenu = () => {
    const cb = (e) => {
      const ignore =
        e.target === dropdownContentRef.current ||
        e.composedPath().includes(toggleThemeRef.current);

      if (!ignore) {
        setShowMenu(false);
        window.removeEventListener("click", cb);
      }
    };

    setShowMenu((prev) => {
      if (!prev) {
        setTimeout(() => {
          window.addEventListener("click", cb);
        }, 0);
      }

      return !prev;
    });
  };

  return (
    <nav className={styles.primaryContainer}>
      <Link to={"/"}>
        <ProfilePic src={"/logo.svg"} size={40} />
      </Link>
      <div className={styles.primaryLinksContainer}>
        <Link
          to={"/"}
          className={location.pathname === "/" ? styles.active : ""}
        >
          <IoHome />
        </Link>
        <Link
          to={"/friends"}
          className={`${auth.count.incomingFriendRequests > 0 ? styles.alert : ""} ${location.pathname.startsWith("/friends") ? styles.active : ""}`}
        >
          <IoPeople />
        </Link>
        <Link
          to={"/users"}
          className={location.pathname === "/users" ? styles.active : ""}
        >
          <IoSearchSharp />
        </Link>
      </div>
      <div className={styles.dropdown}>
        <button
          className={styles.dropBtn}
          onClick={(e) => {
            e.target.blur();
            toggleShowMenu();
          }}
        >
          <ProfilePic src={auth.user.profile.avatar} size={40} />
          <span>
            <IoChevronDownSharp />
          </span>
        </button>
        <div
          className={`${styles.dropdownContent} ${showMenu ? styles.show : ""}`}
          ref={dropdownContentRef}
        >
          <Link to={`/users/${auth.user.id}`}>
            <ProfilePic src={auth.user.profile.avatar} size={30} />
            {auth.user.username}
          </Link>
          <Link to={"/settings"}>
            <IoSettingsSharp />
            Settings
          </Link>
          <button
            className={styles.themeBtn}
            type="button"
            onClick={toggleTheme}
            ref={toggleThemeRef}
          >
            {theme === THEMES.DARK ? <IoSunnyOutline /> : <IoMoonOutline />}
            {theme === THEMES.DARK ? "Dark" : "Light"} mode
          </button>
          <Link to={"/logout"}>
            <IoLogOut />
            Logout
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default SiteNav;
