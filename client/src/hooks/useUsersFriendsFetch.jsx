import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import useApiPrivate from "./useApiPrivate";

function useUsersFriendsFetch(userId, resultsPerPage) {
  const [page, setPage] = useState(0);
  const [count, setCount] = useState(0);
  const [friends, setFriends] = useState(null);
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
        `/users/${userId}/friends?page=${page + 1}&resultsPerPage=${resultsPerPage}`,
        {
          signal: controller.signal,
        },
      )
      .then((resp) => {
        const friendships = resp.data.friends.map((friendship) => {
          const friend =
            friendship.user1.id === userId
              ? friendship.user2
              : friendship.user1;
          delete friendship.user1;
          delete friendship.user2;
          return { ...friendship, friend };
        });
        if (friends) {
          setFriends((prev) => [...prev, ...friendships]);
        } else {
          setFriends(friendships);
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
  }, [api, friends, page, userId, resultsPerPage]);

  useEffect(() => {
    if (friends) return;

    fetchData();

    return doAbort;
  }, [friends, fetchData]);

  const fetchNext = () => {
    if (!hasMore || isLoading) return;

    fetchData();
  };

  return {
    page,
    count,
    hasMore,
    friends,
    isLoading,
    error,
    refetch: fetchData,
    fetchNext,
  };
}

export default useUsersFriendsFetch;
