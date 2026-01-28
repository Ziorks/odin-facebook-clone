import { useEffect, useRef, useState } from "react";
import useRefreshToken from "./useRefreshToken";

function usePersistLogin() {
  const refresh = useRefreshToken();
  const [isLoading, setIsLoading] = useState(true);
  const hasMounted = useRef(false);

  useEffect(() => {
    if (hasMounted.current) return;
    hasMounted.current = true;

    refresh()
      .catch(() => {
        console.log("persist login failed");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [refresh]);

  return isLoading;
}

export default usePersistLogin;
