import { Link, useOutletContext, Outlet } from "react-router-dom";
// import styles from "./AboutLayout.module.css";

function AboutLayout() {
  const { user } = useOutletContext();

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
