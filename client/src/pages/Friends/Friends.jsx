import { useEffect, useRef, useContext } from "react";
import AuthContext from "../../contexts/AuthContext";
import useDataFetchPaginated from "../../hooks/useDataFetchPaginated";
import useIntersection from "../../hooks/useIntersection";
import { getFriendFromFriendship } from "../../utils/helperFunctions";
import UserThumbnail from "../../components/UserThumbnail";
// import styles from "./Friends.module.css";

function Friends() {
  const { auth } = useContext(AuthContext);
  const { ref, isVisible } = useIntersection("100px");
  const {
    data: friendships,
    count,
    isLoading,
    error,
    fetchNext,
  } = useDataFetchPaginated(`/friendship/friends`, 10);
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
            <ul>
              {friendships.map((friendship, index) => {
                const friend = getFriendFromFriendship(
                  friendship,
                  auth.user.id,
                );
                return (
                  <li
                    key={friendship.id}
                    ref={index + 1 === friendships.length ? ref : undefined}
                  >
                    <UserThumbnail user={friend} />
                  </li>
                );
              })}
            </ul>
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
