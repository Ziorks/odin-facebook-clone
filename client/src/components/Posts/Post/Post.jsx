import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaCaretRight,
  FaUserFriends,
  FaRegEdit,
  FaRegThumbsUp,
  FaThumbsUp,
} from "react-icons/fa";
import {
  IoEarth,
  IoLockClosed,
  IoChatbubbleOutline,
  IoEllipsisHorizontal,
  IoTrashSharp,
} from "react-icons/io5";
import { format } from "date-fns";
import AuthContext from "../../../contexts/AuthContext";
import PostContext from "../../../contexts/PostContext";
import useApiPrivate from "../../../hooks/useApiPrivate";
import useDataFetchPaginated from "../../../hooks/useDataFetchPaginated";
import { MAX_UPLOAD_SIZE_POST } from "../../../utils/constants";
import Modal from "../../Modal";
import TextAndImageForm from "../../TextAndImageForm";
import PostPrivacySelect from "../../PostPrivacySelect";
import ProfilePic from "../../ProfilePic";
import ProfilePicLink from "../../ProfilePicLink";
import LikeButton from "./LikeButton";
import Comments from "./Comments";
import CommentForm from "./CommentForm";
import Likes from "./Likes";
import styles from "./Post.module.css";

function EditModal() {
  const { auth } = useContext(AuthContext);
  const { post, onPostEdit, toggleEditModal } = useContext(PostContext);

  const [privacy, setPrivacy] = useState(post.privacy);
  const [changesMade, setChangesMade] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState(null);
  const api = useApiPrivate();

  const handleSubmit = (content, file, imageUrl) => {
    setIsLoading(true);
    setErrors(null);

    const formData = new FormData();

    formData.append("privacy", privacy);
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
        toggleEditModal();
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

  const handleChange = () => {
    if (!changesMade) setChangesMade(true);
  };

  return (
    <Modal
      heading="Edit Post"
      handleClose={() => {
        let confirmed = true;
        if (changesMade) {
          confirmed = confirm(
            "You have unsaved changes. Are you sure you want to leave?",
          );
        }
        if (confirmed) {
          toggleEditModal();
        }
      }}
    >
      <div className={styles.editModalFormContainer}>
        <TextAndImageForm
          content={post.content}
          imageUrl={post.mediaUrl}
          handleSubmit={handleSubmit}
          onChange={handleChange}
          placeholderText={"Edit your post"}
          charLimit={2000}
          maxFilesize={MAX_UPLOAD_SIZE_POST}
          disableClearOnSubmit={true}
          disableSubmit={!changesMade}
        >
          <PostPrivacySelect
            value={privacy}
            onChange={(e) => {
              setPrivacy(e.target.value);
              handleChange();
            }}
            avatar={auth.user.profile.avatar}
            username={auth.user.username}
          />
        </TextAndImageForm>
        {isLoading && <p>Saving...</p>}
        {errors && (
          <ul>
            {errors.map((error, i) => (
              <li key={i}>{error.msg}</li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
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
    <Modal heading="Delete Post" handleClose={toggleDeleteModal}>
      <div className={styles.deleteModalContainer}>
        <p>Are you sure you want to delete this post forever?</p>
        <div className={styles.deleteModalActionsContainer}>
          <button onClick={toggleDeleteModal} disabled={isLoading}>
            Cancel
          </button>
          <button onClick={handleDelete} disabled={isLoading}>
            DELETE
          </button>
        </div>
        {isLoading && <p>Deleting post...</p>}
        {error && <p>An error occured. Please try again.</p>}
      </div>
    </Modal>
  );
}

function PostContent({ handleNCommentsBtnClick, handleCommentBtnClick }) {
  const { auth } = useContext(AuthContext);
  const { post, onPostLikeChange, toggleDeleteModal, toggleEditModal } =
    useContext(PostContext);
  const [showMenu, setShowMenu] = useState(false);

  const DROP_CONTENT_ID = `post-${post.id}_dropContent`;

  const toggleShowMenu = () => {
    const cb = (e) => {
      const ignore = e.target.id === DROP_CONTENT_ID;
      if (!ignore) {
        setShowMenu(false);
        window.removeEventListener("click", cb);
      }
    };

    setShowMenu((prev) => {
      if (!prev) {
        setTimeout(() => {
          window.addEventListener("click", cb);
        }, 0);
      }

      return !prev;
    });
  };

  return (
    <>
      <div className={styles.contentHeader}>
        <ProfilePicLink
          to={`/users/${post.author.id}`}
          src={post.author.profile.avatar}
          size={40}
        />
        <div className={styles.contentDetails}>
          <p>
            <Link to={`/users/${post.author.id}`}>{post.author.username}</Link>
            {post.type === "PROFILE_PIC_UPDATE" &&
              "updated their profile picture"}
            {post.author.id !== post.wall.id && (
              <>
                <FaCaretRight />
                <Link to={`/users/${post.wall.id}`}>{post.wall.username}</Link>
              </>
            )}
          </p>
          <p>
            <time>{format(post.createdAt, "MMMM d, yyyy")}</time>
            <span>·</span>
            {post.privacy === "PUBLIC" && <IoEarth />}
            {post.privacy === "FRIENDS_ONLY" && <FaUserFriends />}
            {post.privacy === "PRIVATE" && <IoLockClosed />}
          </p>
        </div>
        {auth.user.id === post.author.id && (
          <div className={styles.dropdown}>
            <button
              className={styles.dropBtn}
              onClick={(e) => {
                e.target.blur();
                toggleShowMenu();
              }}
            >
              <IoEllipsisHorizontal />
            </button>
            <div
              className={`${styles.dropdownContent} ${showMenu ? styles.show : ""}`}
              id={DROP_CONTENT_ID}
            >
              {post.type === "REGULAR" && (
                <button onClick={toggleEditModal}>
                  <FaRegEdit />
                  Edit post
                </button>
              )}
              <button onClick={toggleDeleteModal}>
                <IoTrashSharp />
                Delete post
              </button>
            </div>
          </div>
        )}
      </div>
      <div className={styles.contentBody}>
        {post.type === "REGULAR" && <p>{post.content}</p>}
        {post.mediaUrl && <img src={post.mediaUrl} />}
      </div>
      <div className={styles.likesAndComments}>
        <Likes
          nLikes={post._count.likes}
          myLike={post.myLike}
          path={`/posts/${post.id}/likes`}
        />
        {post._count.comments > 0 && (
          <button
            className={styles.commentsBtn}
            onClick={handleNCommentsBtnClick}
          >
            {`${post._count.comments} comment${post._count.comments > 1 ? "s" : ""}`}
          </button>
        )}
      </div>
      <div className={styles.contentActions}>
        <LikeButton
          like={post.myLike}
          likePath={`/posts/${post.id}/likes`}
          onSuccess={onPostLikeChange}
        >
          {post.myLike ? <FaThumbsUp /> : <FaRegThumbsUp />}
        </LikeButton>
        <button onClick={handleCommentBtnClick}>
          <IoChatbubbleOutline />
          Comment
        </button>
      </div>
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
  const { auth } = useContext(AuthContext);
  const {
    post,
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
    <Modal
      heading={`${post.author.username}'s Post`}
      handleClose={toggleDetailsModal}
    >
      <div className={styles.postModalContainer}>
        <div>
          <div>
            <PostContent
              handleNCommentsBtnClick={() => focusRef(commentsSectionRef)}
              handleCommentBtnClick={() => focusRef(commentFormRef)}
            />
          </div>
          <Comments setCommentListRef={setCommentsSectionRef} />
        </div>
        <div>
          <ProfilePic src={auth.user.profile.avatar} size={30} />
          <CommentForm
            apiPostPath={`/posts/${post.id}/comments`}
            placeholderText={`Comment as ${auth.user.username}`}
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
  const { auth } = useContext(AuthContext);
  const [post, setPost] = useState(postObj);
  const [showPostDetails, setShowPostDetails] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
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
  const toggleEditModal = () => {
    setShowEditModal((prev) => !prev);
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
        toggleEditModal,
        useComments,
        pendingIdCounterRef,
      }}
    >
      {showPostDetails && <PostModal />}
      {showEditModal && <EditModal />}
      {showDeleteModal && <DeleteModal />}
      <article className={styles.primaryPostContainer}>
        <PostContent
          handleNCommentsBtnClick={toggleDetailsModal}
          handleCommentBtnClick={handleCommentBtnClick}
        />
        {postObj.topComment && post._count.comments > 1 && (
          <button
            className={styles.viewMoreCommentsBtn}
            onClick={toggleDetailsModal}
          >
            View more comments
          </button>
        )}
        <Comments idWhitelist={commentIdsWhitelist} />
        {!disableComments && (
          <CommentForm
            apiPostPath={`/posts/${post.id}/comments`}
            placeholderText={`Comment as ${auth.user.username}`}
            setInputRef={setCommentFormRef}
            onSubmit={(pendingComment) => {
              onPostCommentSubmit(pendingComment);
              addPendingIdToWhitelist(pendingComment.pendingId);
            }}
            onError={onPostCommentError}
            onSuccess={onPostCommentPosted}
          />
        )}
      </article>
    </PostContext.Provider>
  );
}

export default Post;
