import { useEffect, useRef, useContext } from "react";
import AuthContext from "../../contexts/AuthContext";
import useDataFetchPaginated from "../../hooks/useDataFetchPaginated";
import useIntersection from "../../hooks/useIntersection";
import FriendList from "../../components/FriendList/FriendList";
// import styles from "./Friends.module.css";

function Friends() {
  const { auth } = useContext(AuthContext);
  const { ref: visibleRef, isVisible } = useIntersection("100px");
  const {
    data: friendships,
    count,
    isLoading,
    error,
    fetchNext,
  } = useDataFetchPaginated(`/friendship/friends`);
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
    <>
      <h2>My Friends</h2>
      {friendships &&
        (count > 0 ? (
          <>
            <p>
              {count} friend{count !== 1 && "s"}
            </p>
            <FriendList
              friendships={friendships}
              currentUserId={auth.user.id}
              setLastItemRef={visibleRef}
            />
          </>
        ) : (
          <p>You have no friends</p>
        ))}
      {isLoading && <p>Loading...</p>}
      {error && (
        <p>
          An error occured <button onClick={fetchNext}>Try again</button>
        </p>
      )}
    </>
  );
}

export default Friends;
