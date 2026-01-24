import { useCallback, useContext, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import AuthContext from "../../../contexts/AuthContext";
import PostContext from "../../../contexts/PostContext";
import useApiPrivate from "../../../hooks/useApiPrivate";
import Modal from "../../Modal";
import LikeButton from "./LikeButton";
import Comment from "./Comment";
import Comments from "./Comments";
import CommentForm from "./CommentForm";
import styles from "./Post.module.css";
import Likes from "./Likes/Likes";

function EditForm({ handleClose }) {
  const { post, onPostEdit } = useContext(PostContext);
  const [formContent, setFormContent] = useState(post.content);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const api = useApiPrivate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    api
      .put(`/posts/${post.id}`, { content: formContent })
      .then((resp) => {
        handleClose();
        onPostEdit(resp.data.post);
      })
      .catch((err) => {
        setError(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <form>
      <textarea
        onChange={(e) => setFormContent(e.target.value)}
        value={formContent}
      />
      <div>
        <button type="submit" onClick={handleSubmit} disabled={isLoading}>
          Save
        </button>
        <button onClick={handleClose} disabled={isLoading}>
          Cancel
        </button>
        {isLoading && <span>Saving...</span>}
        {error && <span>An error occured. Please try again.</span>}
      </div>
    </form>
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
          <p>{post.content}</p>
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
                <button onClick={() => setShowEditForm(true)}>Edit</button>
                <button onClick={toggleDeleteModal}>Delete</button>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
}

function PostModal() {
  const { toggleDetailsModal } = useContext(PostContext);
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
      <PostContent
        handleNCommentsBtnClick={() => focusRef(commentsSectionRef)}
        handleCommentBtnClick={() => focusRef(commentFormRef)}
      />
      <Comments
        setCommentListRef={setCommentsSectionRef}
        setCommentFormRef={setCommentFormRef}
      />
    </Modal>
  );
}

function Post({ post: postObj, removePost, disableCommentForm }) {
  const [post, setPost] = useState(postObj);
  const [topComment, setTopComment] = useState(postObj.topComment);
  const [showPostDetails, setShowPostDetails] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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
  const onPostComment = () => {
    setPost((prev) => ({
      ...prev,
      _count: { ...prev._count, comments: prev._count.comments + 1 },
    }));
  };
  const onPostEdit = (post) => {
    setPost(post);
  };
  const onPostDelete = () => {
    removePost?.(post.id);
  };

  const onCommentChange = (comment) => {
    if (comment.id === topComment?.id) {
      setTopComment((prev) => ({ ...comment, reply: prev.reply }));
    }

    if (comment.id === topComment?.reply?.id) {
      setTopComment((prev) => ({ ...prev, reply: comment }));
    }
  };

  const toggleDetailsModal = () => {
    setShowPostDetails((prev) => !prev);
  };
  const toggleDeleteModal = () => {
    setShowDeleteModal((prev) => !prev);
  };

  return (
    <PostContext.Provider
      value={{
        post,
        setPost,
        onPostLikeChange,
        onPostComment,
        onPostEdit,
        onPostDelete,
        onCommentChange,
        toggleDetailsModal,
        toggleDeleteModal,
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
          handleCommentBtnClick={toggleDetailsModal}
        />
        {topComment && (
          <>
            {post._count.comments > 1 && (
              <button onClick={toggleDetailsModal}>View more comments</button>
            )}
            <Comment comment={topComment} disableReplies={true}>
              {topComment.reply ? (
                <Comment comment={topComment.reply} disableReplies={true} />
              ) : (
                topComment._count.replies > 1 && (
                  <div>
                    <button onClick={toggleDetailsModal}>
                      {`View ${topComment._count.replies} replies`}
                    </button>
                  </div>
                )
              )}
            </Comment>
          </>
        )}
        {!disableCommentForm && <CommentForm />}
      </div>
    </PostContext.Provider>
  );
}

export default Post;
