import UserThumbnail from "../UserThumbnail";
// import styles from "./FriendList.module.css";

function FriendList({ friendships, currentUserId, setLastItemRef }) {
  return (
    <ul>
      {friendships.map((friendship, index) => {
        const friend =
          friendship.user1.id === currentUserId
            ? friendship.user2
            : friendship.user1;
        return (
          <li
            key={friendship.id}
            ref={index + 1 === friendships.length ? setLastItemRef : undefined}
          >
            <UserThumbnail user={friend} />
          </li>
        );
      })}
    </ul>
  );
}

export default FriendList;
