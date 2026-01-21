import { useState, useEffect, useRef, useContext, useCallback } from "react";
import { Link } from "react-router-dom";
import { AiOutlineLike } from "react-icons/ai";
import { format } from "date-fns";
import useApiPrivate from "../../hooks/useApiPrivate";
import useIntersection from "../../hooks/useIntersection";
import useDataFetchPaginated from "../../hooks/useDataFetchPaginated";
import AuthContext from "../../contexts/AuthContext";
import Modal from "../Modal";
import Comment from "../Comment";
import CommentForm from "../CommentForm";
import LikeButton from "../LikeButton";
import styles from "./Posts.module.css";

function EditForm({ id, content, handleCancel, onSuccess }) {
  const [formContent, setFormContent] = useState(content);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const api = useApiPrivate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    api
      .put(`/posts/${id}`, { content: formContent })
      .then(() => onSuccess?.(formContent))
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
        <button onClick={handleCancel} disabled={isLoading}>
          Cancel
        </button>
        {isLoading && <span>Saving...</span>}
        {error && <span>An error occured. Please try again.</span>}
      </div>
    </form>
  );
}

function DeleteModal({ id, handleClose, onSuccess }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const api = useApiPrivate();

  const handleDelete = () => {
    setError(null);
    setIsLoading(true);

    api
      .delete(`/posts/${id}`)
      .then(() => onSuccess?.())
      .catch((err) => {
        setError(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <Modal handleClose={handleClose}>
      <p>Are you sure you want to delete this post forever?</p>
      <div>
        <button onClick={handleDelete} disabled={isLoading}>
          DELETE
        </button>
        <button onClick={handleClose} disabled={isLoading}>
          Cancel
        </button>
      </div>
      {isLoading && <p>Deleting post...</p>}
      {error && <p>An error occured. Please try again.</p>}
    </Modal>
  );
}

function Comments({ postId, setRef }) {
  const {
    data: comments,
    count,
    isLoading,
    error,
    fetchNext,
  } = useDataFetchPaginated(`/posts/${postId}/comments`, 10);
  const { ref: visibleRef, isVisible } = useIntersection("100px");
  const fetchNextRef = useRef(fetchNext);

  useEffect(() => {
    fetchNextRef.current = fetchNext;
  }, [fetchNext]);

  useEffect(() => {
    if (isVisible) {
      fetchNextRef.current();
    }
  }, [isVisible]);

  return (
    <>
      {comments &&
        (count > 0 ? (
          <ol className={styles.commentsList} ref={setRef}>
            {comments.map((comment, index) => (
              <li
                key={comment.id}
                ref={index + 1 === comments.length ? visibleRef : undefined}
              >
                <Comment comment={comment} />
              </li>
            ))}
          </ol>
        ) : (
          <p>No comments yet</p>
        ))}
      {isLoading && <p>Loading comments...</p>}
      {error && (
        <p>
          An error occured <button onClick={fetchNext}>Try again</button>
        </p>
      )}
    </>
  );
}

function PostContent({
  post,
  onLike,
  onUnlike,
  onEdit,
  handleNCommentsBtnClick,
  handleCommentBtnClick,
  handleDeleteBtnClick,
}) {
  const { auth } = useContext(AuthContext);
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
        <EditForm
          id={post.id}
          content={post.content}
          handleCancel={() => setShowEditForm(false)}
          onSuccess={(content) => {
            onEdit(content);
            setShowEditForm(false);
          }}
        />
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
              liked={post.likedByMe}
              targetType={"POST"}
              onLike={onLike}
              onUnlike={onUnlike}
            />
            <button onClick={handleCommentBtnClick}>Comment</button>
            {auth.user.id === post.author.id && (
              <>
                <button onClick={() => setShowEditForm(true)}>Edit</button>
                <button onClick={handleDeleteBtnClick}>Delete</button>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
}

function PostModal({
  post,
  onLike,
  onUnlike,
  onEdit,
  handleDeleteBtnClick,
  handleClose,
}) {
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
    <Modal handleClose={handleClose}>
      <PostContent
        post={post}
        onLike={onLike}
        onUnlike={onUnlike}
        onEdit={onEdit}
        handleNCommentsBtnClick={() => focusRef(commentsSectionRef)}
        handleCommentBtnClick={() => focusRef(commentFormRef)}
        handleDeleteBtnClick={handleDeleteBtnClick}
      />
      <Comments postId={post.id} setRef={setCommentsSectionRef} />
      <CommentForm postId={post.id} setInputRef={setCommentFormRef} />
    </Modal>
  );
}

function Post({ post: postObj }) {
  const [post, setPost] = useState(postObj);
  const [showPostDetails, setShowPostDetails] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (!post) return;

  const onLike = () =>
    setPost((prev) => ({
      ...prev,
      _count: { ...prev._count, likes: prev._count.likes + 1 },
      likedByMe: true,
    }));
  const onUnlike = () =>
    setPost((prev) => ({
      ...prev,
      _count: { ...prev._count, likes: prev._count.likes - 1 },
      likedByMe: false,
    }));
  const onEdit = (content) => setPost((prev) => ({ ...prev, content }));
  const toggleDetailsModal = () => {
    setShowPostDetails((prev) => !prev);
  };
  const toggleDeleteModal = () => {
    setShowDeleteModal((prev) => !prev);
  };

  return (
    <>
      {showPostDetails && (
        <PostModal
          post={post}
          onLike={onLike}
          onUnlike={onUnlike}
          onEdit={onEdit}
          handleDeleteBtnClick={toggleDeleteModal}
          handleClose={toggleDetailsModal}
        />
      )}
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
          post={post}
          onLike={onLike}
          onUnlike={onUnlike}
          onEdit={onEdit}
          handleNCommentsBtnClick={toggleDetailsModal}
          handleCommentBtnClick={toggleDetailsModal}
          handleDeleteBtnClick={toggleDeleteModal}
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
        <CommentForm postId={post.id} />
      </div>
    </>
  );
}

function Posts({ posts, fetchNext }) {
  const { ref, isVisible } = useIntersection("100px");
  const fetchNextRef = useRef(fetchNext);

  useEffect(() => {
    fetchNextRef.current = fetchNext;
  }, [fetchNext]);

  useEffect(() => {
    if (isVisible) {
      fetchNextRef.current();
    }
  }, [isVisible]);

  return (
    <ol>
      {posts.map((post, index) => (
        <li ref={index + 1 === posts.length ? ref : undefined} key={post.id}>
          <Post post={post} />
        </li>
      ))}
    </ol>
  );
}

export default Posts;
