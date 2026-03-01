import { useContext, useState } from "react";
import { useOutletContext } from "react-router-dom";
import AuthContext from "../../contexts/AuthContext";
import useDataFetchPaginated from "../../hooks/useDataFetchPaginated";
import PostCreationModal from "../PostCreationModal";
import ProfilePicLink from "../ProfilePicLink";
import Posts from "../Posts";
import styles from "./Wall.module.css";

function Wall() {
  const { auth } = useContext(AuthContext);
  const { user } = useOutletContext();
  const [showPostModal, setShowPostModal] = useState(false);
  const {
    data: posts,
    setData: setPosts,
    isLoading,
    error,
    fetchNext,
  } = useDataFetchPaginated(`/users/${user.id}/wall`, { dataLengthLimit: 30 });

  const handleClose = () => setShowPostModal(false);
  const onSuccess = (post) => {
    setPosts((prev) => (prev ? [post, ...prev] : [post]));
    handleClose();
  };
  const removePost = (postId) => {
    setPosts((prev) => prev.filter((post) => post.id !== postId));
  };

  const isCurrentUser = auth.user.id === user.id;

  return (
    <div className={styles.primaryContainer}>
      {showPostModal && (
        <PostCreationModal
          handleClose={handleClose}
          wallId={user.id}
          onSuccess={onSuccess}
        />
      )}
      <div className={styles.postCreationContainer}>
        <ProfilePicLink
          to={`/users/${auth.user.id}`}
          src={auth.user.profile.avatar}
          size={40}
        />
        <button onClick={() => setShowPostModal(true)}>
          {isCurrentUser
            ? "What's on your mind"
            : `Write something to ${user.profile.firstName || user.username}`}
        </button>
      </div>
      {posts &&
        (posts.length > 0 ? (
          <Posts posts={posts} removePost={removePost} fetchNext={fetchNext} />
        ) : (
          <p>
            There are no posts on
            {isCurrentUser ? " your" : ` ${user.username}'s`} wall
          </p>
        ))}
      {isLoading && <p>Loading...</p>}
      {error && (
        <p>
          An error occured <button onClick={fetchNext}>Try again</button>
        </p>
      )}
    </div>
  );
}

export default Wall;
