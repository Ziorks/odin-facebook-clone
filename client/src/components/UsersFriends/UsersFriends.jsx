import { useEffect, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import useUsersFriendsFetch from "../../hooks/useUsersFriendsFetch";
import useIntersection from "../../hooks/useIntersection";
import UserThumbnail from "../UserThumbnail";
// import styles from "./UsersFriends.module.css";

function UsersFriends() {
  const { user } = useOutletContext();
  const { ref, isVisible } = useIntersection("100px");
  const { count, friends, isLoading, error, fetchNext, refetch } =
    useUsersFriendsFetch(user.id, 10);
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
      {friends &&
        (count > 0 ? (
          <>
            <p>
              {count} friend{count !== 1 && "s"}
            </p>
            <ul>
              {friends.map((friendship, index) => (
                <li
                  ref={index + 1 === friends.length ? ref : undefined}
                  key={friendship.id}
                >
                  <UserThumbnail user={friendship.friend} />
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p>{user.username} has no friends</p>
        ))}
      {isLoading && <p>Loading...</p>}
      {error && (
        <p>
          An error occured <button onClick={refetch}>Try again</button>
        </p>
      )}
    </>
  );
}

export default UsersFriends;
