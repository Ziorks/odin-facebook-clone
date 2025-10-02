import useDataFetch from "../../hooks/useDataFetch";
// import styles from "./Friends.module.css";

function MyFriends() {
  const { data, error, isLoading } = useDataFetch("/friendship/friends");

  return (
    <>
      <h2>My Friends</h2>
      {isLoading && <p>Loading...</p>}
      {error && <p>An error occured</p>}
      {data && data.friends.length > 0 ? (
        <ul>
          {data.friends.map((friend) => (
            <li key={friend.id}>{friend.username}</li>
          ))}
        </ul>
      ) : (
        <p>You have no friends</p>
      )}
    </>
  );
}

function PendingRequests() {
  const { data, error, isLoading } = useDataFetch("/friendship/pending");

  return (
    <>
      <h2>Pending Requests</h2>
      {isLoading && <p>Loading...</p>}
      {error && <p>An error occured</p>}
      {data && data.pendingFriends.length > 0 ? (
        <ul>
          {data.pendingFriends.map((friend) => (
            <li key={friend.id}>{friend.username}</li>
          ))}
        </ul>
      ) : (
        <p>You have no pending requests</p>
      )}
    </>
  );
}

function Friends() {
  return (
    <>
      <h1>Friends Page</h1>
      <br />
      <MyFriends />
      <br />
      <PendingRequests />
    </>
  );
}

export default Friends;
