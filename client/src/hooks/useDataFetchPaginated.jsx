import { useState, useRef, useCallback, useEffect } from "react";
import useApiPrivate from "./useApiPrivate";

function useDataFetchPaginated(
  path,
  {
    resultsPerPage = 10,
    disableFetchOnMount = false,
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
  const hasMounted = useRef(false);

  const nPages = Math.ceil(count / resultsPerPage);
  const hasMore = page < nPages;

  const fetchData = useCallback(
    (page) => {
      if (page < 1 || (data && page > nPages) || isLoading) return;

      setError(false);
      setIsLoading(true);

      api
        .get(
          `${path}?page=${page}&resultsPerPage=${resultsPerPage}${query ? `&query=${query}` : ""}`,
        )
        .then((resp) => {
          const { results, count } = resp.data;
          setData((prev) => {
            const newData =
              prev && !overwriteDataOnFetch ? [...prev, ...results] : results;
            if (!dataLengthLimit) return newData;
            return newData.length > dataLengthLimit
              ? newData.slice(newData.length - dataLengthLimit)
              : newData;
          });
          setCount(count);
          setPage(page);
        })
        .catch(() => {
          setError(true);
        })
        .finally(() => {
          setIsLoading(false);
        });
    },
    [
      api,
      data,
      nPages,
      isLoading,
      path,
      resultsPerPage,
      query,
      overwriteDataOnFetch,
      dataLengthLimit,
    ],
  );

  useEffect(() => {
    if (data || hasMounted.current || disableFetchOnMount) return;
    hasMounted.current = true;

    fetchData(1);
  }, [data, disableFetchOnMount, fetchData]);

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
