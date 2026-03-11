import { useContext, useState } from "react";
import AuthContext from "../../contexts/AuthContext";
import useDataFetchPaginated from "../../hooks/useDataFetchPaginated";
import ProfilePicLink from "../ProfilePicLink";
import PostCreationModal from "../PostCreationModal";
import Posts from "../Posts";
import LoadingAndError from "../LoadingAndError";
import styles from "./Feed.module.css";

function Feed() {
  const { auth } = useContext(AuthContext);
  const [showPostModal, setShowPostModal] = useState(false);
  const {
    data: posts,
    setData: setPosts,
    hasMore,
    isLoading,
    error,
    fetchNext,
  } = useDataFetchPaginated("/feed", {
    dataLengthLimit: 30,
  });

  const handleClose = () => setShowPostModal(false);
  const onSuccess = (post) => {
    setPosts((prev) => (prev ? [post, ...prev] : [post]));
    handleClose();
  };
  const removePost = (postId) => {
    setPosts((prev) => prev.filter((post) => post.id !== postId));
  };

  return (
    <div className={styles.primaryContainer}>
      {showPostModal && (
        <PostCreationModal
          handleClose={handleClose}
          wallId={auth.user.id}
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
          What's on your mind,{" "}
          {auth.user.profile.firstName || auth.user.username}?
        </button>
      </div>
      {posts && (
        <>
          {posts.length > 0 && (
            <Posts
              posts={posts}
              removePost={removePost}
              disableComments={true}
              fetchNext={fetchNext}
            />
          )}
          {!hasMore && (
            <p className={styles.endMsg}>You've reached the end of your feed</p>
          )}
        </>
      )}
      <LoadingAndError
        isLoading={isLoading}
        error={error}
        onTryAgain={fetchNext}
      />
    </div>
  );
}

export default Feed;
