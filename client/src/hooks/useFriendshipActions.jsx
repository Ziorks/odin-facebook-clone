import { useState } from "react";
import useApiPrivate from "./useApiPrivate";
import useRefreshToken from "./useRefreshToken";

function useFriendshipActions(friendshipId) {
  const api = useApiPrivate();
  const refresh = useRefreshToken();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const removeFriendship = async (confirmMsg) => {
    if (
      !confirm(confirmMsg || "Are you sure you want to delete this friendship?")
    )
      return Promise.resolve(false);

    setIsLoading(true);
    setError(null);

    return api
      .delete(`/friendship/${friendshipId}/remove`)
      .then(async () => {
        await refresh();
        return true;
      })
      .catch((err) => {
        console.error(err);
        setError(
          "An error occured while removing friendship. Please try again.",
        );
        throw new Error(err);
      })
      .finally(() => setIsLoading(false));
  };

  const createRequest = (userId) => {
    setIsLoading(true);
    setError(null);
    return api
      .post("/friendship/request", { userId })
      .then((resp) => resp.data?.friendship)
      .catch((err) => {
        console.error(err);
        setError(
          "An error occured while creating friend request. Please try again.",
        );
        throw new Error(err);
      })
      .finally(() => setIsLoading(false));
  };
  const acceptRequest = () => {
    setIsLoading(true);
    setError(null);
    return api
      .put(`/friendship/${friendshipId}/accept`)
      .then(async (resp) => {
        await refresh();
        return resp.data?.friendship;
      })
      .catch((err) => {
        console.error(err);
        setError(
          "An error occured while accepting friend request. Please try again.",
        );
        throw new Error(err);
      })
      .finally(() => setIsLoading(false));
  };

  return { isLoading, error, removeFriendship, createRequest, acceptRequest };
}

export default useFriendshipActions;
