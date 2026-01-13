import useDataFetch from "../../hooks/useDataFetch";
import FriendRequestDisplay from "../../components/FriendRequestDisplay";
// import styles from "./PendingRequestsOutgoing.module.css";

function PendingRequestsOutgoing() {
  const { data, error, isLoading } = useDataFetch(
    "/friendship/pending/outgoing",
  );

  const nRequests = data?.requests?.length;

  return (
    <>
      {isLoading && <p>Loading...</p>}
      {error && <p>An error occured</p>}
      {data &&
        (nRequests > 0 ? (
          <>
            <p>
              {nRequests} outgoing request{nRequests !== 1 && "s"}
            </p>
            <ul>
              {data.requests.map((request) => (
                <li key={request.id}>
                  <FriendRequestDisplay request={request} />
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p>You have no outgoing requests</p>
        ))}
    </>
  );
}

export default PendingRequestsOutgoing;
