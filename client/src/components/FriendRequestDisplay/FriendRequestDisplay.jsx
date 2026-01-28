import { useContext, useState } from "react";
import AuthContext from "../../contexts/AuthContext";
import useFriendshipActions from "../../hooks/useFriendshipActions";
import UserThumbnail from "../UserThumbnail";
import { formatDistanceToNowShort } from "../../utils/helperFunctions";
// import styles from "./FriendRequestDisplay.module.css";

const REQUEST_STATUS = { PENDING: 0, ACCEPTED: 1, DECLINED: 2 };

function FriendRequestDisplay({ request }) {
  const { auth } = useContext(AuthContext);
  const [status, setStatus] = useState(REQUEST_STATUS.PENDING);
  const { acceptRequest, removeFriendship, isLoading, error } =
    useFriendshipActions(request.id);

  const isIncoming = request.user2.id === auth.user.id;

  const handleAccept = () => {
    acceptRequest().then(() => {
      setStatus(REQUEST_STATUS.ACCEPTED);
    });
  };
  const handleRemove = () => {
    removeFriendship(
      `Are you sure you want to ${isIncoming ? "decline" : "cancel"} this request?`,
    ).then((isRemoved) => {
      if (isRemoved) setStatus(REQUEST_STATUS.DECLINED);
    });
  };

  return (
    <UserThumbnail user={isIncoming ? request.user1 : request.user2}>
      {isIncoming ? (
        <>
          {status === REQUEST_STATUS.PENDING && (
            <>
              <button onClick={handleAccept} disabled={isLoading}>
                Accept
              </button>
              <button onClick={handleRemove} disabled={isLoading}>
                Decline
              </button>
            </>
          )}
          {status === REQUEST_STATUS.ACCEPTED && <p>Accepted</p>}
          {status === REQUEST_STATUS.DECLINED && <p>Declined</p>}
        </>
      ) : (
        <>
          {status === REQUEST_STATUS.PENDING && (
            <>
              <button onClick={handleRemove} disabled={isLoading}>
                Cancel
              </button>
            </>
          )}
          {status === REQUEST_STATUS.DECLINED && <p>Canceled</p>}
        </>
      )}
      {error && <p>An error occurred</p>}
      <p>{formatDistanceToNowShort(request.createdAt)}</p>
    </UserThumbnail>
  );
}

export default FriendRequestDisplay;
