import { useState, useRef, useCallback, useEffect } from "react";
import axios from "axios";
import useApiPrivate from "./useApiPrivate";

function useDataFetchPaginated(
  path,
  {
    resultsPerPage = 10,
    disableFetchOnMount = false,
    dataLengthLimit = 0,
  } = {},
) {
  const [page, setPage] = useState(0);
  const [count, setCount] = useState(0);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const api = useApiPrivate();
  const abortRef = useRef(null);
  const hasMore = page * resultsPerPage < count;

  const doAbort = () => {
    if (abortRef.current) {
      abortRef.current();
      abortRef.current = null;
    }
  };

  const fetchData = useCallback(() => {
    doAbort();

    const controller = new AbortController();
    abortRef.current = () => controller.abort();

    setError(false);
    setIsLoading(true);

    api
      .get(`${path}?page=${page + 1}&resultsPerPage=${resultsPerPage}`, {
        signal: controller.signal,
      })
      .then((resp) => {
        const { results, count } = resp.data;
        setData((prev) => {
          const newData = prev ? [...prev, ...results] : results;
          if (!dataLengthLimit) return newData;
          return newData.length > dataLengthLimit
            ? newData.slice(newData.length - dataLengthLimit)
            : newData;
        });
        setCount(count);
        setPage((prev) => prev + 1);
      })
      .catch((err) => {
        if (axios.isCancel(err)) return;
        setError(true);
      })
      .finally(() => {
        setIsLoading(false);
        abortRef.current = null;
      });
  }, [api, page, path, resultsPerPage, dataLengthLimit]);

  useEffect(() => {
    if (data || disableFetchOnMount) return;

    fetchData();

    return doAbort;
  }, [data, disableFetchOnMount, fetchData]);

  const fetchNext = () => {
    if ((data && !hasMore) || isLoading) return;

    fetchData();
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
    count,
    hasMore,
    setData,
    fetchNext,
    reset,
  };
}

export default useDataFetchPaginated;
