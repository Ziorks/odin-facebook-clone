import { useContext } from "react";
import { Link, useOutletContext, Outlet } from "react-router-dom";
import AuthContext from "../../contexts/AuthContext";
import useDataFetchPaginated from "../../hooks/useDataFetchPaginated";
import { getFriendFromFriendship } from "../../utils/helperFunctions";
import UserThumbnail from "../../components/UserThumbnail";
// import styles from "./AboutLayout.module.css";

function FriendsPreview() {
  const { user } = useOutletContext();
  const {
    data: friendships,
    count,
    isLoading,
    error,
    fetchNext,
  } = useDataFetchPaginated(`/users/${user.id}/friends`, 8);

  return (
    <div>
      <h2>Friends</h2>
      {friendships &&
        (count > 0 ? (
          <>
            <p>
              {count} friend{count !== 1 && "s"}
            </p>
            <ul>
              {friendships.map((friendship) => {
                const friend = getFriendFromFriendship(friendship, user.id);
                return (
                  <li key={friendship.id}>
                    <UserThumbnail user={friend} />
                  </li>
                );
              })}
            </ul>
          </>
        ) : (
          <p>{user.username} has no friends</p>
        ))}
      {isLoading && <p>Loading...</p>}
      {error && (
        <p>
          An error occurred <button onClick={fetchNext}>Try again</button>
        </p>
      )}
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
