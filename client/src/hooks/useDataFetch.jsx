import { useEffect, useState } from "react";
import useApiPrivate from "./useApiPrivate";
import axios from "axios";
import { useCallback } from "react";
import { useRef } from "react";

function useDataFetch(path) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const api = useApiPrivate();
  const abortRef = useRef(null);

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
        abortRef.current = null;
      });
  }, [api, path]);

  useEffect(() => {
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
