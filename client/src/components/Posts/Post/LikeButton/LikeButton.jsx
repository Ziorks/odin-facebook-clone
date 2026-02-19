import { useState } from "react";
import useApiPrivate from "../../../../hooks/useApiPrivate";
import Spinner from "../../../Spinner";

function LikeButton({ children, like, likePath, onSuccess }) {
  const [isLoading, setIsLoading] = useState(false);
  const api = useApiPrivate();

  const handleLike = () => {
    setIsLoading(true);

    api
      .post(likePath)
      .then((resp) => {
        onSuccess?.(resp.data.like);
      })
      .finally(() => setIsLoading(false));
  };

  const handleUnlike = () => {
    setIsLoading(true);

    api
      .delete(`/likes/${like.id}`)
      .then(() => {
        onSuccess?.(null);
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <button
      onClick={like ? handleUnlike : handleLike}
      disabled={isLoading}
      style={like && { color: "var(--color-primary-200)" }}
    >
      {isLoading ? (
        <Spinner size={20} />
      ) : (
        <>
          {children}
          Like
        </>
      )}
    </button>
  );
}

export default LikeButton;
