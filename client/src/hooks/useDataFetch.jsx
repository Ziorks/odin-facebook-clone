import { useEffect, useState, useRef, useCallback } from "react";
import useApiPrivate from "./useApiPrivate";

function useDataFetch(path) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const api = useApiPrivate();
  const hasMounted = useRef(false);

  const fetchData = useCallback(() => {
    if (isLoading) return;

    setData(null);
    setError(false);
    setIsLoading(true);

    api
      .get(path)
      .then((resp) => {
        setData(resp.data);
      })
      .catch(() => {
        setError(true);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isLoading, api, path]);

  useEffect(() => {
    if (hasMounted.current) return;
    hasMounted.current = true;

    fetchData();
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
