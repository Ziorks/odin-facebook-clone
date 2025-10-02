import { useEffect, useState } from "react";
import useApiPrivate from "./useApiPrivate";
import axios from "axios";

function useDataFetch(path) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const api = useApiPrivate();

  useEffect(() => {
    setIsLoading(true);
    const controller = new AbortController();

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

    return () => {
      controller.abort();
    };
  }, [api, path]);

  return { data, setData, isLoading, setIsLoading, error, setError };
}

export default useDataFetch;
