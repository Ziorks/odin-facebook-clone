import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import AuthContext from "../../../contexts/AuthContext";
import PostContext from "../../../contexts/PostContext";
import useApiPrivate from "../../../hooks/useApiPrivate";
import useDataFetchPaginated from "../../../hooks/useDataFetchPaginated";
import Modal from "../../Modal";
import TextAndImageForm from "../../TextAndImageForm";
import LikeButton from "./LikeButton";
import Comments from "./Comments";
import CommentForm from "./CommentForm";
import Likes from "./Likes";
import styles from "./Post.module.css";

function EditForm({ handleClose }) {
  const { post, onPostEdit } = useContext(PostContext);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState(null);
  const api = useApiPrivate();

  const handleSubmit = (content, file, imageUrl) => {
    setIsLoading(true);
    setErrors(null);

    const formData = new FormData();

    if (content) {
      formData.append("content", content);
    }
    if (file) {
      formData.append("image", file);
    } else if (imageUrl) {
      formData.append("imageUrl", imageUrl);
    }

    api
      .put(`/posts/${post.id}`, formData)
      .then((resp) => {
        handleClose();
        onPostEdit(resp.data.post);
      })
      .catch((err) => {
        console.error("post edit error", err);

        if (err.response?.status === 400) {
          setErrors(err.response.data.errors);
        } else {
          setErrors([
            { msg: err.response?.data?.message || "Something went wrong." },
          ]);
        }
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <>
      <TextAndImageForm
        content={post.content}
        imageUrl={post.mediaUrl}
        handleSubmit={handleSubmit}
        placeholderText={"Edit your post"}
        charLimit={2000}
        imageInputId={`post-image-input_${post.id}`}
        disableClearOnSubmit={true}
      />
      <button onClick={handleClose} disabled={isLoading}>
        Cancel
      </button>
      {isLoading && <p>Saving...</p>}
      {errors && (
        <ul>
          {errors.map((error, i) => (
            <li key={i}>{error.msg}</li>
          ))}
        </ul>
      )}
    </>
  );
}

function DeleteModal() {
  const { post, onPostDelete, toggleDeleteModal } = useContext(PostContext);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const api = useApiPrivate();

  const handleDelete = () => {
    setError(null);
    setIsLoading(true);

    api
      .delete(`/posts/${post.id}`)
      .then(onPostDelete)
      .catch((err) => {
        setError(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <Modal handleClose={toggleDeleteModal}>
      <p>Are you sure you want to delete this post forever?</p>
      <div>
        <button onClick={handleDelete} disabled={isLoading}>
          DELETE
        </button>
        <button onClick={toggleDeleteModal} disabled={isLoading}>
          Cancel
        </button>
      </div>
      {isLoading && <p>Deleting post...</p>}
      {error && <p>An error occured. Please try again.</p>}
    </Modal>
  );
}

function PostContent({ handleNCommentsBtnClick, handleCommentBtnClick }) {
  const { auth } = useContext(AuthContext);
  const { post, onPostLikeChange, toggleDeleteModal } = useContext(PostContext);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showLikesModal, setShowLikesModal] = useState(false);

  return (
    <>
      {showLikesModal && (
        <LikesModal handleClose={() => setShowLikesModal(false)} />
      )}
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
      {showEditForm ? (
        <EditForm handleClose={() => setShowEditForm(false)} />
      ) : (
        <>
          {post.type === "REGULAR" && (
            <p className={styles.postContent}>{post.content}</p>
          )}
          {post.type === "PROFILE_PIC_UPDATE" && (
            <p>{`${post.author.username} updated their profile picture`}</p>
          )}
          {post.mediaUrl && <img src={post.mediaUrl} />}
          <div>
            <Likes
              nLikes={post._count.likes}
              myLike={post.myLike}
              path={`/posts/${post.id}/likes`}
            />
            {post._count.comments > 0 && (
              <button onClick={handleNCommentsBtnClick}>
                {`${post._count.comments} comment${post._count.comments > 1 ? "s" : ""}`}
              </button>
            )}
          </div>
          <div>
            <LikeButton
              like={post.myLike}
              likePath={`/posts/${post.id}/like`}
              onSuccess={onPostLikeChange}
            />
            <button onClick={handleCommentBtnClick}>Comment</button>
            {auth.user.id === post.author.id && (
              <>
                {post.type === "REGULAR" && (
                  <button onClick={() => setShowEditForm(true)}>Edit</button>
                )}
                <button onClick={toggleDeleteModal}>Delete</button>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
}

//TODO:This maybe useful later
//get a comments array with pending comments removed

// const getOnlyPostedComments = (comments) => {
//   return comments.reduce((prev, comment) => {
//     //Not posted? -> remove it
//     if (!Object.hasOwn(comment, "id")) return prev;

//     //No replies? -> no need to remove pending comments
//     if (!Object.hasOwn(comment, "replies")) return [...prev, comment];

//     //Posted & has replies -> recursively remove pending replies
//     return [
//       ...prev,
//       { ...comment, replies: getOnlyPostedComments(comment.replies) },
//     ];
//   }, []);
// };

function PostModal() {
  const {
    toggleDetailsModal,
    onPostCommentSubmit,
    onPostCommentError,
    onPostCommentPosted,
  } = useContext(PostContext);
  const commentsSectionRef = useRef();
  const setCommentsSectionRef = useCallback((node) => {
    commentsSectionRef.current = node;
  }, []);
  const commentFormRef = useRef();
  const setCommentFormRef = useCallback((node) => {
    commentFormRef.current = node;
  }, []);
  const focusRef = (ref) => {
    if (!ref.current) return;
    ref.current.focus();
  };

  return (
    <Modal handleClose={toggleDetailsModal}>
      <div className={styles.postModalContainer}>
        <div>
          <PostContent
            handleNCommentsBtnClick={() => focusRef(commentsSectionRef)}
            handleCommentBtnClick={() => focusRef(commentFormRef)}
          />
          <Comments setCommentListRef={setCommentsSectionRef} />
        </div>
        <div>
          <CommentForm
            setInputRef={setCommentFormRef}
            onSubmit={onPostCommentSubmit}
            onError={onPostCommentError}
            onSuccess={onPostCommentPosted}
          />
        </div>
      </div>
    </Modal>
  );
}

function Post({ post: postObj, removePost, disableComments }) {
  const [post, setPost] = useState(postObj);
  const [showPostDetails, setShowPostDetails] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [commentIdsWhitelist, setCommentIdsWhitelist] = useState(() => {
    let whitelist = { pendingIds: [], ids: [] };
    const { topComment } = postObj;
    if (topComment) {
      whitelist.ids.push(topComment.id);
      const { replies } = topComment;
      if (replies.length > 0) {
        whitelist.ids.push(replies[0].id);
      }
    }
    return whitelist;
  });

  const useComments = useDataFetchPaginated(`/posts/${post.id}/comments`, {
    disableFetchOnChange: true,
  });

  const hasMounted = useRef(false);
  const pendingIdCounterRef = useRef(1);
  const commentFormRef = useRef();
  const setCommentFormRef = useCallback(
    (node) => (commentFormRef.current = node),
    [],
  );

  useEffect(() => {
    //add top comment to comments arr on mount
    if (hasMounted.current) return;
    hasMounted.current = true;

    if (!postObj.topComment) return;

    useComments.setData([{ ...postObj.topComment }]);
  }, [postObj, useComments]);

  if (!post) return;

  const onPostLikeChange = (like) =>
    setPost((prev) => ({
      ...prev,
      _count: {
        ...prev._count,
        likes: prev._count.likes + (like ? 1 : -1),
      },
      myLike: like,
    }));
  const onPostEdit = (post) => {
    setPost(post);
  };
  const onPostDelete = () => {
    removePost?.(post.id);
  };
  const onPostCommentSubmit = (pendingComment) => {
    useComments.setData((prev) => {
      return prev === null ? [pendingComment] : [pendingComment, ...prev];
    });
  };
  const onPostCommentError = (pendingComment, error) => {
    useComments.setData((prev) =>
      prev.map((comment) => {
        if (comment.pendingId === pendingComment.pendingId) {
          return { ...pendingComment, error };
        }
        return comment;
      }),
    );
  };
  const onPostCommentPosted = (postedComment) => {
    useComments.setData((prev) =>
      prev.map((comment) => {
        if (comment.pendingId === postedComment.pendingId) {
          return postedComment;
        }
        return comment;
      }),
    );
    setPost((prev) => ({
      ...prev,
      _count: { ...prev._count, comments: prev._count.comments + 1 },
    }));
  };

  const addPendingIdToWhitelist = (pendingId) => {
    setCommentIdsWhitelist((prev) => ({
      ...prev,
      pendingIds: [...prev.pendingIds, pendingId],
    }));
  };

  const toggleDetailsModal = () => {
    setShowPostDetails((prev) => !prev);
  };
  const toggleDeleteModal = () => {
    setShowDeleteModal((prev) => !prev);
  };

  const handleCommentBtnClick = () => {
    if (commentFormRef.current) {
      commentFormRef.current.focus();
    } else toggleDetailsModal();
  };

  return (
    <PostContext.Provider
      value={{
        post,
        setPost,
        onPostLikeChange,
        onPostCommentSubmit,
        onPostCommentError,
        onPostCommentPosted,
        onPostEdit,
        onPostDelete,
        addPendingIdToWhitelist,
        toggleDetailsModal,
        toggleDeleteModal,
        useComments,
        pendingIdCounterRef,
      }}
    >
      {showPostDetails && <PostModal />}
      {showDeleteModal && (
        <DeleteModal
          id={post.id}
          handleClose={toggleDeleteModal}
          onSuccess={() => {
            setPost(null);
            toggleDeleteModal();
          }}
        />
      )}
      <div className={styles.container}>
        <PostContent
          handleNCommentsBtnClick={toggleDetailsModal}
          handleCommentBtnClick={handleCommentBtnClick}
        />
        {postObj.topComment && post._count.comments > 1 && (
          <button onClick={toggleDetailsModal}>View more comments</button>
        )}
        <Comments idWhitelist={commentIdsWhitelist} />
        {!disableComments && (
          <CommentForm
            setInputRef={setCommentFormRef}
            onSubmit={(pendingComment) => {
              onPostCommentSubmit(pendingComment);
              addPendingIdToWhitelist(pendingComment.pendingId);
            }}
            onError={onPostCommentError}
            onSuccess={onPostCommentPosted}
          />
        )}
      </div>
    </PostContext.Provider>
  );
}

export default Post;
