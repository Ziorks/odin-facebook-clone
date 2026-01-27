import { useState, useRef } from "react";
import useDataFetchPaginated from "../../hooks/useDataFetchPaginated";
import UserThumbnail from "../../components/UserThumbnail";
import PaginationNavigation from "../../components/PaginationNavigation/PaginationNavigation";
import styles from "./UserSearch.module.css";

function UserSearch() {
  const [query, setQuery] = useState("");
  const {
    data: users,
    page,
    nPages,
    count,
    isLoading,
    error,
    fetchNext,
    fetchPrev,
    fetchPage,
    reset,
  } = useDataFetchPaginated(`/users/search`, {
    query,
    overwriteDataOnFetch: true,
  });
  const resetTimeout = useRef();

  return (
    <>
      <h1>User Search Page</h1>
      <input
        type="text"
        name="query"
        id="query"
        value={query}
        onChange={(e) => {
          {
            if (resetTimeout.current) clearTimeout(resetTimeout.current);
            setQuery(e.target.value);
            resetTimeout.current = setTimeout(() => {
              reset();
              resetTimeout.current = null;
            }, 1000);
          }
        }}
      />
      {isLoading && <p>Loading...</p>}
      {error && <p>An error occured</p>}
      {users && (
        <>
          <p>{count} results</p>
          {users.length > 0 ? (
            <ul className={styles.users_list}>
              {users.map((user) => (
                <li key={user.id}>
                  <UserThumbnail user={user} />
                </li>
              ))}
            </ul>
          ) : (
            <p>
              I'm not sure how you are viewing this because there are no users
              in the database :P
            </p>
          )}
          <PaginationNavigation
            currentPage={page}
            nPages={nPages}
            maxPageBtns={7}
            fetchNext={fetchNext}
            fetchPrev={fetchPrev}
            fetchPage={fetchPage}
          />
        </>
      )}
    </>
  );
}

export default UserSearch;
