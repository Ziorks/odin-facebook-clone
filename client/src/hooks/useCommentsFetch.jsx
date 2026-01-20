import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import useApiPrivate from "./useApiPrivate";

function useCommentsFetch(postId, resultsPerPage) {
  const [page, setPage] = useState(0);
  const [count, setCount] = useState(0);
  const [comments, setComments] = useState(null);
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
        `/posts/${postId}/comments?page=${page + 1}&resultsPerPage=${resultsPerPage}`,
        {
          signal: controller.signal,
        },
      )
      .then((resp) => {
        const { comments, count } = resp.data;
        setComments((prev) => (prev ? [...prev, ...comments] : comments));
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
  }, [api, page, postId, resultsPerPage]);

  useEffect(() => {
    if (comments) return;

    fetchData();

    return doAbort;
  }, [comments, fetchData]);

  const fetchNext = () => {
    if (!hasMore || isLoading) return;

    fetchData();
  };

  return {
    page,
    count,
    hasMore,
    comments,
    isLoading,
    error,
    refetch: fetchData,
    fetchNext,
  };
}

export default useCommentsFetch;
