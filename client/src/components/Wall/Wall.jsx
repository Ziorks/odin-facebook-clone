import { useContext, useState } from "react";
import { useOutletContext } from "react-router-dom";
import AuthContext from "../../contexts/AuthContext";
import useDataFetchPaginated from "../../hooks/useDataFetchPaginated";
import PostCreationModal from "../PostCreationModal";
import Posts from "../Posts";
// import styles from "./Wall.module.css";

function Wall() {
  const { auth } = useContext(AuthContext);
  const { user } = useOutletContext();
  const wallId = user.id;
  const [showPostModal, setShowPostModal] = useState(false);
  const {
    data: posts,
    count,
    isLoading,
    error,
    setData: setPosts,
    fetchNext,
  } = useDataFetchPaginated(`/wall/${wallId}`, 10);

  const handleClose = () => setShowPostModal(false);
  const onSuccess = (post) => {
    setPosts((prev) => [post, ...prev]);
    handleClose();
  };

  const isCurrentUser = auth.user.id === wallId;

  return (
    <>
      {showPostModal && (
        <PostCreationModal
          handleClose={handleClose}
          wallId={wallId}
          onSuccess={onSuccess}
        />
      )}
      <div>
        <button onClick={() => setShowPostModal(true)}>
          {isCurrentUser
            ? "What's on your mind"
            : `Write something to ${user.username}`}
        </button>
      </div>
      {posts &&
        (count > 0 ? (
          <Posts posts={posts} fetchNext={fetchNext} />
        ) : (
          <p>
            There are no posts on{" "}
            {isCurrentUser ? "your" : `${user.username}'s`} wall
          </p>
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

export default Wall;
