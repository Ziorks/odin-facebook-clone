import { useContext, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  IoSearchSharp,
  IoPeople,
  IoChevronDownSharp,
  IoHome,
  IoSettingsSharp,
  IoLogOut,
} from "react-icons/io5";
import AuthContext from "../../contexts/AuthContext";
import ProfilePic from "../ProfilePic";
import logo from "../../../public/logo.svg";
import styles from "./SiteNav.module.css";

function SiteNav() {
  const { auth } = useContext(AuthContext);
  const [showMenu, setShowMenu] = useState(false);
  const location = useLocation();

  const toggleShowMenu = () => {
    setShowMenu((prev) => !prev);
  };

  useEffect(() => {
    const cb = (e) => {
      const { classList } = e.target;
      const ignore =
        !showMenu ||
        classList.contains(styles.dropdownContent) ||
        classList.contains(styles.dropBtn);

      if (!ignore) {
        toggleShowMenu();
      }
    };

    window.addEventListener("click", cb);

    return () => window.removeEventListener("click", cb);
  }, [showMenu]);

  return (
    <nav className={styles.primaryContainer}>
      <Link to={"/"}>
        <ProfilePic src={logo} size={40} />
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
        >
          <Link to={`/users/${auth.user.id}`}>
            <ProfilePic src={auth.user.profile.avatar} size={30} />
            {auth.user.username}
          </Link>
          <Link to={"/settings"}>
            <IoSettingsSharp />
            Settings
          </Link>
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
