import { useContext } from "react";
import { Link, useOutletContext, Outlet } from "react-router-dom";
import AuthContext from "../../contexts/AuthContext";
// import styles from "./AboutLayout.module.css";

function AboutLayout() {
  const { user } = useOutletContext();
  const { auth } = useContext(AuthContext);

  return (
    <>
      <h1>About Page</h1>
      <div>
        <h2>About</h2>
        <nav>
          <Link to={"./about_overview"} preventScrollReset={true}>
            Overview
          </Link>{" "}
          <Link to={"./about_work_and_education"} preventScrollReset={true}>
            Work and education
          </Link>{" "}
          <Link to={"./about_places_lived"} preventScrollReset={true}>
            Places lived
          </Link>{" "}
          <Link to={"./about_contact_info"} preventScrollReset={true}>
            Contact info
          </Link>{" "}
          <Link to={"./about_details"} preventScrollReset={true}>
            Details about {auth.user.id === user.id ? "you" : user.username}
          </Link>
        </nav>
        <Outlet context={{ user }} />
      </div>
      <div>
        <h2>Friends</h2>
        {/* TODO: add sample of users friends and a link to view all their friends */}
      </div>
    </>
  );
}

export default AboutLayout;
