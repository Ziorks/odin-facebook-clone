import { useState, useRef, useCallback, useEffect } from "react";
import axios from "axios";
import useApiPrivate from "./useApiPrivate";

function useDataFetchPaginated(path, resultsPerPage) {
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
        setData((prev) => (prev ? [...prev, ...results] : results));
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
  }, [api, page, path, resultsPerPage]);

  useEffect(() => {
    if (data) return;

    fetchData();

    return doAbort;
  }, [data, fetchData]);

  const fetchNext = () => {
    if ((data && !hasMore) || isLoading) return;

    fetchData();
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
  };
}

export default useDataFetchPaginated;
