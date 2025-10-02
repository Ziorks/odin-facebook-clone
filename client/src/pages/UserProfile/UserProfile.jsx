import { useParams } from "react-router-dom";
import useDataFetch from "../../hooks/useDataFetch";
import useApiPrivate from "../../hooks/useApiPrivate";
import { useContext } from "react";
import AuthContext from "../../contexts/AuthContext";
// import styles from "./UserProfile.module.css";

function UserProfile() {
  const { userId } = useParams();
  const { auth } = useContext(AuthContext);
  const api = useApiPrivate();
  const { data, setData, isLoading, error } = useDataFetch(`/users/${userId}`);

  const handleAdd = () => {
    api
      .post("/friendship/request", { userId: +userId })
      .then((resp) =>
        setData((prev) => ({ ...prev, friendship: resp.data.friendship })),
      )
      .catch((err) => console.log(err));
  };
  const handleAccept = () => {
    api
      .post("/friendship/accept", { id: data.friendship.id })
      .then((resp) =>
        setData((prev) => ({ ...prev, friendship: resp.data.friendship })),
      )
      .catch((err) => console.log(err));
  };
  const handleRemove = () => {
    api
      .post("/friendship/remove", { id: data.friendship.id })
      .then(() => setData((prev) => ({ ...prev, friendship: null })))
      .catch((err) => console.log(err));
  };

  return (
    <>
      <h1>User Profile Page</h1>
      {isLoading && <p>Loading...</p>}
      {error && <p>An error occured</p>}
      {data && (
        <>
          {auth.user.id === data.user.id ? (
            <p>This is you</p> /* TODO: add something better than */
          ) : data.friendship ? (
            data.friendship.accepted ? (
              <button onClick={handleRemove}>Remove Friend</button>
            ) : data.friendship.user1Id === +userId ? (
              <>
                <button onClick={handleAccept}>Accept Request</button>
                <button onClick={handleRemove}>Deny Request</button>
              </>
            ) : (
              <>
                <p>Friend Request Sent</p>
                <button onClick={handleRemove}>Cancel Request</button>
              </>
            )
          ) : (
            <button onClick={handleAdd}>Add Friend</button>
          )}

          <p>Username: {data.user.username}</p>
          <img src={data.user.profile.avatar} style={{ height: "100px" }} />
        </>
      )}
    </>
  );
}

export default UserProfile;
