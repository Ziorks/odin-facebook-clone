import { Link, Outlet, useLocation } from "react-router-dom";
import styles from "./PendingRequestsLayout.module.css";

function PendingRequestsLayout() {
  const location = useLocation();

  const isAtOutgoing = location.pathname.endsWith("outgoing");

  return (
    <div className={styles.primaryContainer}>
      <nav className={styles.navContainer}>
        <Link
          to={"pending_incoming"}
          className={!isAtOutgoing ? styles.active : ""}
        >
          Incoming
        </Link>
        <Link
          to={"pending_outgoing"}
          className={isAtOutgoing ? styles.active : ""}
        >
          Outgoing
        </Link>
      </nav>
      <Outlet />
    </div>
  );
}

export default PendingRequestsLayout;
