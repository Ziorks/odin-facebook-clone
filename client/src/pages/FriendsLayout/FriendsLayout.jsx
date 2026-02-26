import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { IoMenu, IoPersonAdd } from "react-icons/io5";
import { FaUsers } from "react-icons/fa6";
import styles from "./FriendsLayout.module.css";

function FriendsLayout() {
  const [showNav, setShowNav] = useState(false);
  const location = useLocation();

  const toggleShowNav = () => setShowNav((prev) => !prev);

  const isAtIndex = location.pathname === "/friends";

  return (
    <>
      <nav className={`${styles.sidebar} ${showNav ? styles.show : ""}`}>
        <button onClick={toggleShowNav}>
          <IoMenu />
        </button>
        <div
          className={`${styles.linksContainer} ${showNav ? styles.show : ""}`}
        >
          <h1>Friends</h1>
          <Link
            to={""}
            className={isAtIndex ? styles.active : ""}
            onClick={toggleShowNav}
          >
            <FaUsers />
            My Friends
          </Link>
          <Link
            to={"pending"}
            className={!isAtIndex ? styles.active : ""}
            onClick={toggleShowNav}
          >
            <IoPersonAdd />
            Requests
          </Link>
        </div>
      </nav>
      <div className={styles.outletContainer}>
        <Outlet />
      </div>
    </>
  );
}

export default FriendsLayout;
