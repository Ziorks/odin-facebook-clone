import useDataFetch from "../../hooks/useDataFetch";
import CommentForm from "../CommentForm";
import Post from "../Post";
import Modal from "../Modal";
import Comment from "../Comment";
import styles from "./PostDetailsModal.module.css";

function PostDetailsModal({
  post,
  onLike,
  onUnlike,
  onEdit,
  onDelete,
  handleClose,
}) {
  //TODO: this should be infinite scroll
  const { data, isLoading, error } = useDataFetch(`/posts/${post.id}/comments`);

  return (
    <Modal handleClose={handleClose}>
      {/* TODO: this post should focus comment form when comment buttons are clicked */}
      <Post
        post={post}
        onLike={onLike}
        onUnlike={onUnlike}
        onEdit={onEdit}
        onDelete={onDelete}
      />
      {isLoading && <p>Loading comments...</p>}
      {error && <p>{error}</p>}
      {data && data.comments.length > 0 ? (
        <ol className={styles.commentsList}>
          {data.comments.map((comment) => (
            <li key={comment.id}>
              <Comment comment={comment} />
            </li>
          ))}
        </ol>
      ) : (
        <p>No comments yet</p>
      )}
      <CommentForm postId={post.id} />
    </Modal>
  );
}

export default PostDetailsModal;
