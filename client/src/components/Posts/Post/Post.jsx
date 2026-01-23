import { useCallback, useContext, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AiOutlineLike } from "react-icons/ai";
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

function EditForm({ handleClose }) {
  const { post, onPostChange } = useContext(PostContext);
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
      .then(() => {
        handleClose();
        onPostChange();
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
  const { post, setPost, toggleDeleteModal } = useContext(PostContext);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const api = useApiPrivate();

  const handleDelete = () => {
    setError(null);
    setIsLoading(true);

    api
      .delete(`/posts/${post.id}`)
      .then(() => setPost(null))
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
  const { post, onPostChange, toggleDeleteModal } = useContext(PostContext);
  const [showEditForm, setShowEditForm] = useState(false);

  return (
    <>
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
            {post._count.likes > 0 && (
              <span>
                {post._count.likes}
                <AiOutlineLike />
              </span>
            )}
            {post._count.comments > 0 && (
              <button onClick={handleNCommentsBtnClick}>
                {`${post._count.comments} comment${post._count.comments > 1 ? "s" : ""}`}
              </button>
            )}
          </div>
          <div>
            <LikeButton
              targetId={post.id}
              isLiked={post.likedByMe}
              targetType={"POST"}
              onLike={onPostChange}
              onUnlike={onPostChange}
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

function Post({ post: postObj }) {
  const [post, setPost] = useState(postObj);
  const [showPostDetails, setShowPostDetails] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const api = useApiPrivate();

  if (!post) return;

  //TODO: possibly disable buttons from doing anything while loading post/comment (functionally, not visually)
  const onPostChange = () => {
    api.get(`/posts/${post.id}`).then((resp) => {
      setPost((prev) => ({ ...resp.data.post, comment: prev.comment }));
    });
  };

  const onCommentChange = (comment) => {
    if (
      comment.id === post.comment?.id ||
      comment.id === post.comment?.reply?.id
    ) {
      api.get(`/comments/${comment.id}`).then((resp) => {
        const fetchedComment = resp.data.comment;
        delete fetchedComment.replies;
        if (comment.id === post.comment?.id) {
          setPost((prev) => ({
            ...prev,
            comment: { ...fetchedComment, reply: prev.comment.reply },
          }));
        } else {
          setPost((prev) => ({
            ...prev,
            comment: { ...prev.comment, reply: fetchedComment },
          }));
        }
      });
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
        onPostChange,
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
        {post.comment && (
          <>
            {post._count.comments > 1 && (
              <button onClick={toggleDetailsModal}>View more comments</button>
            )}
            <Comment comment={post.comment} disableReplies={true}>
              {post.comment.reply ? (
                <Comment comment={post.comment.reply} disableReplies={true} />
              ) : (
                post.comment._count.replies > 1 && (
                  <div>
                    <button onClick={toggleDetailsModal}>
                      {`View ${post.comment._count.replies} replies`}
                    </button>
                  </div>
                )
              )}
            </Comment>
          </>
        )}
        <CommentForm />
      </div>
    </PostContext.Provider>
  );
}

export default Post;
