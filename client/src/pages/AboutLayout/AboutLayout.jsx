import { useContext } from "react";
import { Link, useOutletContext, Outlet } from "react-router-dom";
import AuthContext from "../../contexts/AuthContext";
import useDataFetch from "../../hooks/useDataFetch";
import UserThumbnail from "../../components/UserThumbnail";
// import styles from "./AboutLayout.module.css";

function FriendsPreview() {
  const { user } = useOutletContext();
  const { data, isLoading, error } = useDataFetch(
    `/users/${user.id}/friends?page=1&resultsPerPage=8`,
  );
  return (
    <div>
      <h2>Friends</h2>
      {data &&
        (data.count > 0 ? (
          <>
            <p>
              {data.count} friend{data.count !== 1 && "s"}
            </p>
            <ul>
              {data.friends.map((friendship) => {
                console.log(friendship);

                const friend =
                  friendship.user1.id === user.id
                    ? friendship.user2
                    : friendship.user1;
                return (
                  <li key={friendship.id}>
                    <UserThumbnail user={friend} />
                  </li>
                );
              })}
            </ul>
          </>
        ) : (
          <p>{user.username}has no friends</p>
        ))}
      {isLoading && <p>Loading...</p>}
      {error && <p>An error occurred</p>}
      <Link to={"friends"}>See all</Link>
    </div>
  );
}

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
      <FriendsPreview />
    </>
  );
}

export default AboutLayout;
