import useApiPrivate from "../../../../hooks/useApiPrivate";
// import styles from "./LikeButton.module.css";

function LikeButton({
  targetId,
  targetType,
  isLiked,
  onLike = () => {},
  onUnlike = () => {},
}) {
  const api = useApiPrivate();

  const handleLike = () => {
    api.post("/likes", { targetId, targetType }).then(() => {
      onLike();
    });
  };

  const handleUnlike = () => {
    api
      .delete(`/likes?targetId=${targetId}&targetType=${targetType}`)
      .then(() => {
        onUnlike();
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
