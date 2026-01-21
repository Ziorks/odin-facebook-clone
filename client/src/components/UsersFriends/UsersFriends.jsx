import { useEffect, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import useDataFetchPaginated from "../../hooks/useDataFetchPaginated";
import useIntersection from "../../hooks/useIntersection";
import UserThumbnail from "../UserThumbnail";
import { getFriendFromFriendship } from "../../utils/helperFunctions";
// import styles from "./UsersFriends.module.css";

function UsersFriends() {
  const { user } = useOutletContext();
  const { ref, isVisible } = useIntersection("100px");
  const {
    data: friendships,
    count,
    isLoading,
    error,
    fetchNext,
  } = useDataFetchPaginated(`/users/${user.id}/friends`, 10);
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
      {friendships &&
        (count > 0 ? (
          <>
            <p>
              {count} friend{count !== 1 && "s"}
            </p>
            <ul>
              {friendships.map((friendship, index) => {
                const friend = getFriendFromFriendship(friendship, user.id);
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
          <p>{user.username} has no friends</p>
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

export default UsersFriends;
