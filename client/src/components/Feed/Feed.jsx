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
    isLoading,
    error,
    count,
    setData: setPosts,
    fetchNext,
  } = useDataFetchPaginated("/feed", 10);

  const handleClose = () => setShowPostModal(false);
  const onSuccess = (post) => {
    setPosts((prev) => [post, ...prev]);
    handleClose();
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
        (count > 0 ? (
          <Posts posts={posts} fetchNext={fetchNext} />
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
