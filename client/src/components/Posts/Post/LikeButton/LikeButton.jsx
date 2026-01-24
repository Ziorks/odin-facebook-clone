import { useState } from "react";
import useApiPrivate from "../../../../hooks/useApiPrivate";
// import styles from "./LikeButton.module.css";

function LikeButton({ like, likePath, onSuccess }) {
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
    <>
      {like ? (
        <button onClick={handleUnlike} disabled={isLoading}>
          Unlike
        </button>
      ) : (
        <button onClick={handleLike} disabled={isLoading}>
          Like
        </button>
      )}
    </>
  );
}

export default LikeButton;
