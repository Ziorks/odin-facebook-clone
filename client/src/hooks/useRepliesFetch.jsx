import { useState, useRef, useCallback, useEffect } from "react";
import axios from "axios";
import useApiPrivate from "./useApiPrivate";

function useRepliesFetch(commentId, resultsPerPage) {
  const [page, setPage] = useState(0);
  const [count, setCount] = useState(0);
  const [replies, setReplies] = useState(null);
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
      .get(
        `/comments/${commentId}/replies?page=${page + 1}&resultsPerPage=${resultsPerPage}`,
        {
          signal: controller.signal,
        },
      )
      .then((resp) => {
        const { replies, count } = resp.data;
        setReplies((prev) => (prev ? [...prev, ...replies] : replies));
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
  }, [api, page, commentId, resultsPerPage]);

  useEffect(() => {
    if (replies) return;

    fetchData();

    return doAbort;
  }, [replies, fetchData]);

  const fetchNext = () => {
    if (!hasMore || isLoading) return;

    fetchData();
  };

  return {
    page,
    count,
    hasMore,
    replies,
    isLoading,
    error,
    fetchNext,
  };
}

export default useRepliesFetch;
