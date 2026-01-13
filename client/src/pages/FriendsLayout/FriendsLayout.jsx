import { Link, Outlet } from "react-router-dom";
// import styles from "./FriendsLayout.module.css";

function FriendsLayout() {
  return (
    <>
      <h1>Friends Page</h1>
      <nav>
        <Link to={""}>My Friends</Link> <Link to={"pending"}>Requests</Link>
      </nav>
      <Outlet />
    </>
  );
}

export default FriendsLayout;
