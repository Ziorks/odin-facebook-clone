import { Link, Outlet } from "react-router-dom";
// import styles from "./PendingRequestsLayout.module.css";

function PendingRequestsLayout() {
  return (
    <>
      <nav>
        <Link to={"pending_incoming"}>Incoming</Link>{" "}
        <Link to={"pending_outgoing"}>Outgoing</Link>
      </nav>
      <Outlet />
    </>
  );
}

export default PendingRequestsLayout;
