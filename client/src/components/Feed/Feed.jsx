import { useContext, useState } from "react";
import AuthContext from "../../contexts/AuthContext";
import useFeedFetch from "../../hooks/useFeedFetch";
import PostCreationModal from "../PostCreationModal";
import Posts from "../Posts/Posts";
// import styles from "./Feed.module.css";

function Feed() {
  const { auth } = useContext(AuthContext);
  const [showPostModal, setShowPostModal] = useState(false);
  const { posts, count, isLoading, error, setPosts, fetchNext, refetch } =
    useFeedFetch(10);

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
          An error occured <button onClick={refetch}>Try again</button>
        </p>
      )}
    </>
  );
}

export default Feed;
