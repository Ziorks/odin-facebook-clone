import useDataFetch from "../../hooks/useDataFetch";
import { Link } from "react-router-dom";
import styles from "./UserSearch.module.css";

function UserSearch() {
  const { data, isLoading, error } = useDataFetch(`/users`);

  return (
    <>
      <h1>User Search Page</h1>
      {isLoading && <p>Loading...</p>}
      {error && <p>An error occured</p>}
      {data && data.users.length > 0 ? (
        <ul className={styles.users_list}>
          {data.users.map((user) => (
            <li key={user.id} className={styles.user_card}>
              <Link to={`/users/${user.id}`}>
                <img src={user.profile.avatar} />
                <p> {user.username}</p>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>
          I'm not sure how you are viewing this because there are no users in
          the database :P
        </p>
      )}
    </>
  );
}

export default UserSearch;
