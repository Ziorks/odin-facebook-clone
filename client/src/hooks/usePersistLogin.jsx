import { useEffect, useState } from "react";
import useRefreshToken from "./useRefreshToken";

function usePersistLogin() {
  const refresh = useRefreshToken();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    refresh(controller.signal).finally(() => {
      if (isMounted) {
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return isLoading;
}

export default usePersistLogin;
