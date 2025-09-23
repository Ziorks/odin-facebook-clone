// import styles from "./Home.module.css";

import { useOutletContext } from "react-router-dom";

function Home() {
  const { handleLogout } = useOutletContext();

  return (
    <>
      <h1>Home Page</h1>
      <button onClick={handleLogout}>Logout</button>
    </>
  );
}

export default Home;
