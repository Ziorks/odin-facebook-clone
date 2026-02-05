import { useState, useRef, useCallback, useEffect } from "react";
import axios from "axios";
import useApiPrivate from "./useApiPrivate";
import { getDuplicatesRemovedMerged } from "../utils/helperFunctions";

function useDataFetchPaginated(
  path,
  {
    resultsPerPage = 10,
    disableFetchOnChange = false,
    overwriteDataOnFetch = false,
    dataLengthLimit = 0,
    query,
  } = {},
) {
  const [page, setPage] = useState(0);
  const [count, setCount] = useState(0);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const api = useApiPrivate();
  const abortRef = useRef(null);

  const nPages = Math.ceil(count / resultsPerPage);
  const hasMore = page < nPages;

  const fetchData = useCallback(
    (page) => {
      if (page < 1) return;

      abortRef.current?.();

      const controller = new AbortController();
      abortRef.current = () => {
        controller.abort();
      };

      setError(false);
      setIsLoading(true);

      api
        .get(
          `${path}?page=${page}&resultsPerPage=${resultsPerPage}${query ? `&query=${query}` : ""}`,
          { signal: controller.signal },
        )
        .then((resp) => {
          const { results, count } = resp.data;

          setData((prev) => {
            const newData =
              prev && !overwriteDataOnFetch
                ? getDuplicatesRemovedMerged(prev, results)
                : results;
            if (!dataLengthLimit) return newData;
            return newData.length > dataLengthLimit
              ? newData.slice(newData.length - dataLengthLimit)
              : newData;
          });
          setCount(count);
          setPage(page);
        })
        .catch((err) => {
          if (axios.isCancel(err)) return;
          setError(true);
        })
        .finally(() => {
          setIsLoading(false);
        });
    },
    [api, path, resultsPerPage, query, overwriteDataOnFetch, dataLengthLimit],
  );

  useEffect(() => {
    if (data || disableFetchOnChange) return;

    fetchData(1);

    return () => {
      abortRef.current?.();
    };
  }, [data, disableFetchOnChange, fetchData]);

  const fetchNext = () => {
    fetchData(page + 1);
  };

  const fetchPrev = () => {
    fetchData(page - 1);
  };

  const reset = () => {
    setPage(0);
    setCount(0);
    setData(null);
    setIsLoading(false);
    setError(null);
  };

  return {
    data,
    isLoading,
    error,
    page,
    nPages,
    count,
    hasMore,
    setData,
    fetchNext,
    fetchPrev,
    fetchPage: fetchData,
    reset,
  };
}

export default useDataFetchPaginated;
