import useDataFetch from "../../hooks/useDataFetch";
import FriendRequestDisplay from "../../components/FriendRequestDisplay";
import LoadingAndError from "../../components/LoadingAndError";
import styles from "./PendingRequestsIncoming.module.css";

function PendingRequestsIncoming() {
  const { data, error, isLoading, refetch } = useDataFetch(
    "/friendship/pending/incoming",
  );

  const nRequests = data?.requests?.length;

  return (
    <div className={styles.primaryContainer}>
      <LoadingAndError
        isLoading={isLoading}
        error={error}
        onTryAgain={refetch}
      />
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
