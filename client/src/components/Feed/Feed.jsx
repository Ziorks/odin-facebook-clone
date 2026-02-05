import { useContext, useState } from "react";
import AuthContext from "../../contexts/AuthContext";
import useDataFetchPaginated from "../../hooks/useDataFetchPaginated";
import PostCreationModal from "../PostCreationModal";
import Posts from "../Posts/Posts";
// import styles from "./Feed.module.css";

function Feed() {
  const { auth } = useContext(AuthContext);
  const [showPostModal, setShowPostModal] = useState(false);
  const {
    data: posts,
    setData: setPosts,
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
    <>
      {showPostModal && (
        <PostCreationModal
          handleClose={handleClose}
          wallId={auth.user.id}
          onSuccess={onSuccess}
        />
      )}
      <div>
        <button onClick={() => setShowPostModal(true)}>
          What's on your mind
        </button>
      </div>
      {posts &&
        (posts.length > 0 ? (
          <Posts
            posts={posts}
            removePost={removePost}
            disableComments={true}
            fetchNext={fetchNext}
          />
        ) : (
          <p>There are no posts in your feed</p>
        ))}
      {isLoading && <p>Loading...</p>}
      {error && (
        <p>
          An error occured <button onClick={fetchNext}>Try again</button>
        </p>
      )}
    </>
  );
}

export default Feed;
