import { useContext } from "react";
import { Link, useOutletContext, Outlet, useLocation } from "react-router-dom";
import AuthContext from "../../contexts/AuthContext";
import useDataFetchPaginated from "../../hooks/useDataFetchPaginated";
import FriendList from "../../components/FriendList";
import LoadingAndError from "../../components/LoadingAndError";
import styles from "./AboutLayout.module.css";

function FriendsPreview() {
  const { user, isCurrentUser } = useOutletContext();
  const {
    data: friendships,
    count,
    isLoading,
    error,
    fetchNext,
  } = useDataFetchPaginated(`/users/${user.id}/friends`, { resultsPerPage: 9 });

  return (
    <div className={styles.friendsContainer}>
      <div className={styles.friendsHeader}>
        <h2>Friends</h2>
        {isCurrentUser && (
          <div>
            <Link to={"/friends/pending"}>Friend requests</Link>
            <Link to={"/users"}>Find friends</Link>
          </div>
        )}
      </div>
      <LoadingAndError
        isLoading={isLoading}
        error={error}
        onTryAgain={fetchNext}
      />
      {friendships &&
        (count > 0 ? (
          <div className={styles.friendsListContainer}>
            <p>
              {count} friend{count !== 1 && "s"}
            </p>
            <FriendList friendships={friendships} currentUserId={user.id} />
          </div>
        ) : (
          <p>{user.username} has no friends</p>
        ))}
      <Link className={styles.seeAllFriendsLink} to={"friends"}>
        See all
      </Link>
    </div>
  );
}

const PATHS = {
  INDEX: "about",
  OVERVIEW: "about_overview",
  WORK_AND_EDUCATION: "about_work_and_education",
  PLACES_LIVED: "about_places_lived",
  CONTACT_INFO: "about_contact_info",
  DETAILS: "about_details",
};

function AboutLayout() {
  const { user, isCurrentUser } = useOutletContext();
  const { auth } = useContext(AuthContext);
  const location = useLocation();

  const currentPath = location.pathname.split("/").at(-1);

  return (
    <>
      <div className={styles.aboutContainer}>
        <div className={styles.aboutHeader}>
          <h2>About</h2>
          <nav>
            <Link
              className={
                currentPath === PATHS.INDEX || currentPath === PATHS.OVERVIEW
                  ? styles.active
                  : ""
              }
              to={PATHS.OVERVIEW}
              preventScrollReset={true}
            >
              Overview
            </Link>
            <Link
              className={
                currentPath === PATHS.WORK_AND_EDUCATION ? styles.active : ""
              }
              to={PATHS.WORK_AND_EDUCATION}
              preventScrollReset={true}
            >
              Work and education
            </Link>
            <Link
              className={
                currentPath === PATHS.PLACES_LIVED ? styles.active : ""
              }
              to={PATHS.PLACES_LIVED}
              preventScrollReset={true}
            >
              Places lived
            </Link>
            <Link
              className={
                currentPath === PATHS.CONTACT_INFO ? styles.active : ""
              }
              to={PATHS.CONTACT_INFO}
              preventScrollReset={true}
            >
              Contact info
            </Link>
            <Link
              className={currentPath === PATHS.DETAILS ? styles.active : ""}
              to={PATHS.DETAILS}
              preventScrollReset={true}
            >
              Details about{" "}
              {auth.user.id === user.id
                ? "you"
                : user.profile.firstName || user.username}
            </Link>
          </nav>
        </div>
        <div className={styles.outletContainer}>
          <Outlet context={{ user, isCurrentUser }} />
        </div>
      </div>
      <FriendsPreview />
    </>
  );
}

export default AboutLayout;
