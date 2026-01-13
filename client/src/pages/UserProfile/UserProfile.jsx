import { useContext } from "react";
import { useParams, Outlet, Link } from "react-router-dom";
import useDataFetch from "../../hooks/useDataFetch";
import AuthContext from "../../contexts/AuthContext";
import useFriendshipActions from "../../hooks/useFriendshipActions";
// import styles from "./UserProfile.module.css";

function Friendship({ friendship, setData }) {
  const { userId } = useParams();
  const { isLoading, error, createRequest, acceptRequest, removeFriendship } =
    useFriendshipActions(friendship?.id);

  const handleAdd = () => {
    createRequest(+userId).then((resp) =>
      setData((prev) => ({ ...prev, friendship: resp })),
    );
  };
  const handleAccept = () => {
    acceptRequest().then((resp) =>
      setData((prev) => ({ ...prev, friendship: resp })),
    );
  };

  const handleRemove = () => {
    removeFriendship("Are you sure you want to remove this friend?").then(
      (isRemoved) => {
        if (isRemoved) setData((prev) => ({ ...prev, friendship: null }));
      },
    );
  };

  return (
    <>
      {friendship ? (
        friendship.accepted ? (
          <button onClick={handleRemove} disabled={isLoading}>
            Remove Friend
          </button>
        ) : friendship.user1Id === +userId ? (
          <>
            <button onClick={handleAccept} disabled={isLoading}>
              Accept Request
            </button>
            <button onClick={handleRemove} disabled={isLoading}>
              Deny Request
            </button>
          </>
        ) : (
          <>
            <p>Friend Request Sent</p>
            <button onClick={handleRemove} disabled={isLoading}>
              Cancel Request
            </button>
          </>
        )
      ) : (
        <button onClick={handleAdd} disabled={isLoading}>
          Add Friend
        </button>
      )}{" "}
      {isLoading && <span>Proccessing...</span>}
      {error && <span>{error}</span>}
    </>
  );
}

function UserProfile() {
  const { userId } = useParams();
  const { auth } = useContext(AuthContext);
  const { data, setData, isLoading, error } = useDataFetch(`/users/${userId}`);

  return (
    <>
      <h1>User Profile Page</h1>

      {isLoading && <p>Loading...</p>}
      {error && <p>An error occured</p>}
      {data && (
        <>
          {auth.user.id === data.user.id ? (
            <p>This is you</p> /* TODO: add something better than */
          ) : (
            <Friendship friendship={data.friendship} setData={setData} />
          )}
          <p>Username: {data.user.username}</p>
          <img src={data.user.profile.avatar} style={{ height: "100px" }} />
          <nav>
            <Link to={""}>Posts</Link> <Link to={"about"}>About</Link>{" "}
            <Link to={"friends"}>Friends</Link>
          </nav>
          <Outlet context={{ user: data.user }} />
        </>
      )}
    </>
  );
}

export default UserProfile;
