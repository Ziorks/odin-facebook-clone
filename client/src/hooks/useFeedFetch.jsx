import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import useApiPrivate from "./useApiPrivate";

function useFeedFetch(resultsPerPage) {
  const [page, setPage] = useState(0);
  const [count, setCount] = useState(0);
  const [posts, setPosts] = useState(null);
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
      .get(`/feed?page=${page + 1}&resultsPerPage=${resultsPerPage}`, {
        signal: controller.signal,
      })
      .then((resp) => {
        const feed = resp.data.feed;
        if (posts) {
          setPosts((prev) => [...prev, ...feed]);
        } else {
          setPosts(feed);
        }
        setCount(resp.data.count);
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
  }, [api, posts, page, resultsPerPage]);

  useEffect(() => {
    if (posts) return;

    fetchData();

    return doAbort;
  }, [posts, fetchData]);

  const fetchNext = () => {
    if (!hasMore || isLoading) return;

    fetchData();
  };

  return {
    page,
    count,
    hasMore,
    posts,
    setPosts,
    isLoading,
    error,
    refetch: fetchData,
    fetchNext,
  };
}

export default useFeedFetch;
