import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AiOutlineLike } from "react-icons/ai";
import { format } from "date-fns";
import useDataFetch from "../../hooks/useDataFetch";
import AuthContext from "../../contexts/AuthContext";
import PostCreationModal from "../PostCreationModal";
import CommentForm from "../CommentForm";
import PostDetailsModal from "../PostDetailsModal/PostDetailsModal";
import LikeButton from "../LikeButton";
import styles from "./Posts.module.css";

function Post({ post }) {
  const [likes, setLikes] = useState(post._count.likes);
  const [showPostDetails, setShowPostDetails] = useState(false);

  const onLike = () => setLikes((prev) => prev + 1);
  const onUnlike = () => setLikes((prev) => prev - 1);

  const toggleDetails = () => {
    setShowPostDetails((prev) => !prev);
  };

  return (
    <>
      {showPostDetails && (
        <PostDetailsModal
          handleClose={toggleDetails}
          post={post}
          likes={likes}
          onLike={onLike}
          onUnlike={onUnlike}
        />
      )}
      <div className={styles.container}>
        <div>
          <Link to={`/users/${post.author.id}`}>
            <img src={post.author.profile.avatar} className={styles.avatar} />
          </Link>
          <p>
            <Link to={`/users/${post.author.id}`}>{post.author.username}</Link>
            {post.author.id !== post.wall.id && (
              <>
                {" "}
                &gt;{" "}
                <Link to={`/users/${post.wall.id}`}>{post.wall.username}</Link>
              </>
            )}
          </p>
          <p>{format(post.createdAt, "MMMM d, yyyy")}</p>
        </div>
        <p>{post.content}</p>
        <div>
          {likes > 0 && (
            <span>
              {likes}
              <AiOutlineLike />
            </span>
          )}
          {post._count.comments > 0 && (
            <button onClick={toggleDetails}>
              {`${post._count.comments} comment${post._count.comments > 1 ? "s" : ""}`}
            </button>
          )}
        </div>
        <div>
          <LikeButton
            targetId={post.id}
            liked={post.likedByMe}
            targetType={"POST"}
            onLike={onLike}
            onUnlike={onUnlike}
          />
          <button onClick={toggleDetails}>Comment</button>
        </div>
        {post.comment && (
          <div>
            {post._count.comments > 1 && (
              <button onClick={toggleDetails}>View more comments</button>
            )}
          </div>
        )}
        <CommentForm postId={post.id} />
      </div>
    </>
  );
}

function Posts({ user }) {
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
            data.wall.map((post) => <Post key={post.id} post={post} />)
          ) : (
            <p>This user has no posts</p>
          )}
        </>
      )}
    </>
  );
}

export default Posts;
