import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import useApiPrivate from "./useApiPrivate";

function useDataFetch(path) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const api = useApiPrivate();
  const abortRef = useRef(null);

  const fetchData = useCallback(() => {
    abortRef.current?.();

    const controller = new AbortController();
    abortRef.current = () => {
      controller.abort();
    };

    setData(null);
    setError(false);
    setIsLoading(true);

    api
      .get(path, { signal: controller.signal })
      .then((resp) => {
        setData(resp.data);
      })
      .catch((err) => {
        if (axios.isCancel(err)) return;
        setError(true);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [api, path]);

  useEffect(() => {
    fetchData();

    return () => {
      abortRef.current?.();
    };
  }, [fetchData]);

  return {
    data,
    setData,
    isLoading,
    setIsLoading,
    error,
    setError,
    refetch: fetchData,
  };
}

export default useDataFetch;
