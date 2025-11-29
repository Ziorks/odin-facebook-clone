import { useState } from "react";
import useApiPrivate from "../../hooks/useApiPrivate";

// import styles from "./LikeButton.module.css";

function LikeButton({
  targetId,
  targetType,
  liked,
  onLike = () => {},
  onUnlike = () => {},
}) {
  const [isLiked, setIsLiked] = useState(liked);
  const api = useApiPrivate();

  const handleLike = () => {
    api.post("/likes", { targetId, targetType }).then(() => {
      onLike();
      setIsLiked(true);
    });
  };

  const handleUnlike = () => {
    api
      .delete(`/likes?targetId=${targetId}&targetType=${targetType}`)
      .then(() => {
        onUnlike();
        setIsLiked(false);
      });
  };

  return (
    <>
      {isLiked ? (
        <button onClick={handleUnlike}>Unlike</button>
      ) : (
        <button onClick={handleLike}>Like</button>
      )}
    </>
  );
}

export default LikeButton;
