import { useEffect, useRef, useState } from "react";
import axios from "axios";
const api_key = import.meta.env.VITE_GIPHY_API_KEY;
import styles from "./GifSearch.module.css";

const trendingUrl = `https://api.giphy.com/v1/gifs/trending?api_key=${api_key}`;
const STATUS = { OK: "OK", LOADING: "LOADING", ERROR: "ERROR" };

function GifSearch({ onSelect }) {
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState(STATUS.LOADING);
  const inputRef = useRef();
  const timeout = useRef(null);
  const hasMounted = useRef(false);

  //fetch trending on mount
  useEffect(() => {
    if (hasMounted.current) return;
    hasMounted.current = true;

    doFetch(trendingUrl);
    inputRef.current.focus();
  }, []);

  const doFetch = (url) => {
    setStatus(STATUS.LOADING);
    axios
      .get(url, { withCredentials: false })
      .then((resp) => {
        setResults(resp.data.data);
        setStatus(STATUS.OK);
      })
      .catch((err) => {
        console.error("gif search error", err);
        setStatus(STATUS.ERROR);
      });
  };

  const onInputChange = (e) => {
    if (timeout.current) clearTimeout(timeout.current);

    const query = e.target.value.trim();
    if (!query) return;

    timeout.current = setTimeout(
      () =>
        doFetch(
          `https://api.giphy.com/v1/gifs/search?api_key=${api_key}&q=${query}`,
        ),
      1500,
    );
  };

  return (
    <div className={styles.container}>
      <input
        className={styles.input}
        ref={inputRef}
        type="text"
        name="query"
        id="query"
        autoComplete="off"
        placeholder="Type to search..."
        onChange={onInputChange}
      />
      <div className={styles.resultContainer}>
        {status === STATUS.OK &&
          (results.length > 0 ? (
            <ul className={styles.results}>
              {results.map((result) => (
                <li key={result.id} onClick={() => onSelect?.(result)}>
                  <img src={result.images.preview_webp.url} />
                </li>
              ))}
            </ul>
          ) : (
            <p>No results found</p>
          ))}
        {status === STATUS.LOADING && <p>Loading...</p>}
        {status === STATUS.ERROR && <p>An error occurred</p>}
      </div>
    </div>
  );
}

export default GifSearch;
