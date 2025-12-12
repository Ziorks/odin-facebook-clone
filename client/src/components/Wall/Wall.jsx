import { useContext, useState } from "react";
import { useOutletContext } from "react-router-dom";
import useDataFetch from "../../hooks/useDataFetch";
import AuthContext from "../../contexts/AuthContext";
import PostCreationModal from "../PostCreationModal";
import PostDetailsModal from "../PostDetailsModal";
import CommentForm from "../CommentForm";
import Post from "../Post";
import Comment from "../Comment";
import styles from "./Wall.module.css";

function WallItem({ wallItem }) {
  const [post, setPost] = useState(wallItem);
  const [isDeleted, setIsDeleted] = useState(false);
  const [showPostDetails, setShowPostDetails] = useState(false);

  const onLike = () =>
    setPost((prev) => ({
      ...prev,
      _count: { ...prev._count, likes: prev._count.likes + 1 },
      likedByMe: true,
    }));
  const onUnlike = () =>
    setPost((prev) => ({
      ...prev,
      _count: { ...prev._count, likes: prev._count.likes - 1 },
      likedByMe: false,
    }));
  const onEdit = (content) => setPost((prev) => ({ ...prev, content }));
  const onDelete = () => setIsDeleted(true);
  const toggleDetailsModal = () => {
    setShowPostDetails((prev) => !prev);
  };

  if (isDeleted) return;

  return (
    <>
      {showPostDetails && (
        <PostDetailsModal
          post={post}
          onLike={onLike}
          onUnlike={onUnlike}
          onEdit={onEdit}
          onDelete={onDelete}
          handleClose={toggleDetailsModal}
        />
      )}
      <div className={styles.container}>
        <Post
          post={post}
          onLike={onLike}
          onUnlike={onUnlike}
          onEdit={onEdit}
          onDelete={onDelete}
          toggleDetailsModal={toggleDetailsModal}
        />
        {post.comment && (
          <>
            {post._count.comments > 1 && (
              <button onClick={toggleDetailsModal}>View more comments</button>
            )}
            <Comment comment={post.comment} disableReplies={true}>
              {post.comment.reply ? (
                <Comment comment={post.comment.reply} disableReplies={true} />
              ) : (
                post.comment._count.replies > 1 && (
                  <div>
                    <button onClick={toggleDetailsModal}>
                      {`View ${post.comment._count.replies} replies`}
                    </button>
                  </div>
                )
              )}
            </Comment>
          </>
        )}
        <CommentForm postId={wallItem.id} />
      </div>
    </>
  );
}

function Wall() {
  const { user } = useOutletContext();
  const wallId = user.id;
  const { auth } = useContext(AuthContext);
  const { data, isLoading, error, refetch } = useDataFetch(`/wall/${wallId}`);
  const [showPostModal, setShowPostModal] = useState(false);

  return (
    <>
      {showPostModal && (
        <PostCreationModal
          handleClose={() => setShowPostModal(false)}
          wallId={wallId}
          refetch={refetch}
        />
      )}
      {isLoading && <p>Loading posts...</p>}
      {error && <p>{error}</p>}
      {data && (
        <>
          <div>
            <button onClick={() => setShowPostModal(true)}>
              {auth.user.id === wallId
                ? "What's on your mind"
                : `Write something to ${user.username}`}
            </button>
          </div>
          {data.wall.length > 0 ? (
            data.wall.map((wallItem) => (
              <WallItem key={wallItem.id} wallItem={wallItem} />
            ))
          ) : (
            <p>This user has no posts</p>
          )}
        </>
      )}
    </>
  );
}

export default Wall;
