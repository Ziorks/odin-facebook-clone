import { useEffect, useRef } from "react";
import { Link, useOutletContext } from "react-router-dom";
import useDataFetchPaginated from "../../hooks/useDataFetchPaginated";
import useIntersection from "../../hooks/useIntersection";
import FriendList from "../FriendList";
import Spinner from "../Spinner";
import styles from "./UsersFriends.module.css";

function UsersFriends() {
  const { user, isCurrentUser } = useOutletContext();
  const { ref: visibleRef, isVisible } = useIntersection("100px");
  const {
    data: friendships,
    count,
    isLoading,
    error,
    fetchNext,
  } = useDataFetchPaginated(`/users/${user.id}/friends`);
  const fetchNextRef = useRef(fetchNext);

  useEffect(() => {
    fetchNextRef.current = fetchNext;
  }, [fetchNext]);

  useEffect(() => {
    if (isVisible) {
      fetchNextRef.current();
    }
  }, [isVisible]);

  return (
    <div className={styles.primaryContainer}>
      <div className={styles.header}>
        <h2>Friends</h2>
        {isCurrentUser && (
          <div>
            <Link to={"/friends/pending"}>Friend requests</Link>
            <Link to={"/users"}>Find friends</Link>
          </div>
        )}
      </div>
      {friendships &&
        (count > 0 ? (
          <div className={styles.friendsContainer}>
            <p>
              {count} friend{count !== 1 && "s"}
            </p>
            <FriendList
              friendships={friendships}
              currentUserId={user.id}
              setLastItemRef={visibleRef}
            />
          </div>
        ) : (
          <p>{user.profile.firstName || user.username} has no friends</p>
        ))}
      {isLoading && (
        <div className={styles.loadingContainer}>
          <Spinner size={50} />
        </div>
      )}
      {error && (
        <p>
          An error occured.{" "}
          <button className={styles.retryBtn} onClick={fetchNext}>
            Try again
          </button>
        </p>
      )}
    </div>
  );
}

export default UsersFriends;
