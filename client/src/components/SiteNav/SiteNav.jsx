import { useContext, useState } from "react";
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
import styles from "./SiteNav.module.css";

const DROP_CONTENT_ID = "siteNav_dropContent";

function SiteNav() {
  const { auth } = useContext(AuthContext);
  const [showMenu, setShowMenu] = useState(false);
  const location = useLocation();

  const toggleShowMenu = () => {
    const cb = (e) => {
      const ignore = e.target.id === DROP_CONTENT_ID;
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
          id={DROP_CONTENT_ID}
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
