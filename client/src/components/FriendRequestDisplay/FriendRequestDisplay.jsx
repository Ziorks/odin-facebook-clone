import { useContext, useState } from "react";
import { formatDistanceToNowShort } from "../../utils/helperFunctions";
import AuthContext from "../../contexts/AuthContext";
import useFriendshipActions from "../../hooks/useFriendshipActions";
import UserThumbnail from "../UserThumbnail";
import Spinner from "../Spinner";
import styles from "./FriendRequestDisplay.module.css";

const REQUEST_STATUS = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  DECLINED: "declined",
};

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
      <div className={styles.primaryContainer}>
        {status === REQUEST_STATUS.PENDING && (
          <>
            {isIncoming && (
              <button
                className={styles.acceptBtn}
                onClick={handleAccept}
                disabled={isLoading}
              >
                Accept
              </button>
            )}
            <button
              className={styles.declineBtn}
              onClick={handleRemove}
              disabled={isLoading}
            >
              {isIncoming ? "Decline" : "Cancel"}
            </button>
            <div className={styles.infoContainer}>
              <p>{formatDistanceToNowShort(request.createdAt)}</p>{" "}
              {isLoading && <Spinner size={15} />}
              {error && <p>An error occurred</p>}
            </div>
          </>
        )}
        {status === REQUEST_STATUS.ACCEPTED && <p>Accepted</p>}
        {status === REQUEST_STATUS.DECLINED && (
          <p>{isIncoming ? "Declined" : "Canceled"}</p>
        )}
      </div>
    </UserThumbnail>
  );
}

export default FriendRequestDisplay;
