import FriendRequestDisplay from "../../components/FriendRequestDisplay";
import useDataFetch from "../../hooks/useDataFetch";
import styles from "./PendingRequestsIncoming.module.css";

function PendingRequestsIncoming() {
  const { data, error, isLoading } = useDataFetch(
    "/friendship/pending/incoming",
  );

  const nRequests = data?.requests?.length;

  return (
    <div className={styles.primaryContainer}>
      {isLoading && <p>Loading...</p>}
      {error && <p>An error occured</p>}
      {data &&
        (nRequests > 0 ? (
          <>
            <p className={styles.nRequests}>
              {nRequests} incoming request{nRequests !== 1 && "s"}
            </p>
            <ul className={styles.list}>
              {data.requests.map((request) => (
                <li key={request.id}>
                  <FriendRequestDisplay request={request} />
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p>You have no incoming requests</p>
        ))}
    </div>
  );
}

export default PendingRequestsIncoming;
