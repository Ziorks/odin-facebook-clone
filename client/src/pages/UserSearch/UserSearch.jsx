import { useState, useRef } from "react";
import { IoSearchSharp } from "react-icons/io5";
import useDataFetchPaginated from "../../hooks/useDataFetchPaginated";
import UserThumbnail from "../../components/UserThumbnail";
import PaginationNavigation from "../../components/PaginationNavigation";
import styles from "./UserSearch.module.css";

function UserSearch() {
  const [query, setQuery] = useState("");
  const [resultsQuery, setResultsQuery] = useState("");
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

  const handleQueryChange = (e) => {
    {
      if (resetTimeout.current) clearTimeout(resetTimeout.current);
      setQuery(e.target.value);
      resetTimeout.current = setTimeout(() => {
        reset();
        setResultsQuery(e.target.value.trim());
        resetTimeout.current = null;
      }, 1000);
    }
  };

  return (
    <div className={styles.primaryContainer}>
      <h1>User Search</h1>
      <div className={styles.queryContainer}>
        <IoSearchSharp />
        <input
          type="text"
          placeholder="Type here to search..."
          value={query}
          onChange={handleQueryChange}
        />
      </div>
      <h2>
        {resultsQuery ? `Search results for "${resultsQuery}"` : "All users"}
      </h2>
      {isLoading && <p>Loading...</p>}
      {error && <p>An error occured</p>}
      {users && (
        <div className={styles.results}>
          <p>{count} results found</p>
          {users.length > 0 ? (
            <>
              <ul>
                {users.map((user) => (
                  <li key={user.id}>
                    <UserThumbnail user={user} />
                  </li>
                ))}
              </ul>
              <PaginationNavigation
                currentPage={page}
                nPages={nPages}
                maxPageBtns={7}
                fetchNext={fetchNext}
                fetchPrev={fetchPrev}
                fetchPage={fetchPage}
              />
            </>
          ) : (
            <p>No results</p>
          )}
        </div>
      )}
    </div>
  );
}

export default UserSearch;
