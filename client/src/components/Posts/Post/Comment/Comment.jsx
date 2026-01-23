import { useCallback, useContext, useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AiOutlineLike } from "react-icons/ai";
import AuthContext from "../../../../contexts/AuthContext";
import PostContext from "../../../../contexts/PostContext";
import useApiPrivate from "../../../../hooks/useApiPrivate";
import useDataFetchPaginated from "../../../../hooks/useDataFetchPaginated";
import { formatDistanceToNowShort } from "../../../../utils/helperFunctions";
import Modal from "../../../Modal";
import LikeButton from "../LikeButton";
import CommentForm from "../CommentForm";
import styles from "./Comment.module.css";

function ReplyChain({ commentId }) {
  const {
    data: replies,
    hasMore,
    isLoading,
    error,
    fetchNext,
  } = useDataFetchPaginated(`/comments/${commentId}/replies`, 10);
  return (
    <>
      {replies && (
        <ol className={styles.replyChain}>
          {replies.map((reply) => (
            <li key={reply.id}>
              <Comment comment={reply} />
            </li>
          ))}
        </ol>
      )}
      {hasMore && <button onClick={fetchNext}>View more</button>}
      {isLoading && <p>Loading replies...</p>}
      {error && (
        <p>
          An error occurred <button onClick={fetchNext}>Try again</button>
        </p>
      )}
    </>
  );
}

function EditForm({ id, content, handleCancel, onSuccess }) {
  const { onCommentChange } = useContext(PostContext);
  const [formContent, setFormContent] = useState(content);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const api = useApiPrivate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    api
      .put(`/comments/${id}`, { content: formContent })
      .then((resp) => {
        const comment = resp.data.comment;
        onSuccess?.(comment);
        onCommentChange(comment);
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
  const { onCommentChange } = useContext(PostContext);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const api = useApiPrivate();

  const handleDelete = () => {
    setError(null);
    setIsLoading(true);

    api
      .put(`/comments/${id}/delete`)
      .then((resp) => {
        const comment = resp.data.comment;
        onSuccess?.(comment);
        onCommentChange(comment);
      })
      .catch((err) => {
        setError(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <Modal handleClose={handleClose}>
      <p>Are you sure you want to delete this comment forever?</p>
      <div>
        <button onClick={handleDelete} disabled={isLoading}>
          DELETE
        </button>
        <button onClick={handleClose} disabled={isLoading}>
          Cancel
        </button>
      </div>
      {isLoading && <p>Deleting comment...</p>}
      {error && <p>An error occured. Please try again.</p>}
    </Modal>
  );
}

function Comment({
  children,
  comment: commentObj,
  pending = false,
  disableReplies = false,
}) {
  const { auth } = useContext(AuthContext);
  const { onCommentChange } = useContext(PostContext);

  const [comment, setComment] = useState(commentObj);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const replyFormRef = useRef();
  const setReplyFormRef = useCallback((node) => {
    replyFormRef.current = node;
  }, []);

  useEffect(() => {
    focusReplyForm();
  }, [showReplyForm]);

  useEffect(() => {
    setComment(commentObj);
  }, [commentObj]);

  const likeCount = comment._count?.likes;
  const replyCount = comment._count?.replies;

  const focusReplyForm = () => {
    if (!replyFormRef.current) return;
    replyFormRef.current.focus();
  };

  const onLike = () => {
    setComment((prev) => ({
      ...prev,
      _count: {
        ...prev._count,
        likes: prev._count.likes + 1,
      },
      likedBySample: [
        { id: auth.user.id, username: auth.user.username },
        ...prev.likedBySample,
      ],
      likedByMe: true,
    }));
    onCommentChange(comment);
  };
  const onUnLike = () => {
    setComment((prev) => ({
      ...prev,
      _count: {
        ...prev._count,
        likes: prev._count.likes - 1,
      },
      likedBySample: prev.likedBySample.slice(1),
      likedByMe: false,
    }));
    onCommentChange(comment);
  };

  return (
    <>
      {showDeleteModal && (
        <DeleteModal
          id={comment.id}
          handleClose={() => setShowDeleteModal(false)}
          onSuccess={(comment) => {
            setComment(comment);
            setShowDeleteModal(false);
          }}
        />
      )}
      <div className={styles.container}>
        <Link to={`/users/${comment.author.id}`}>
          <img src={comment.author.profile.avatar} className={styles.avatar} />
        </Link>
        <Link to={`/users/${comment.author.id}`}>
          <p>{comment.author.username}</p>
        </Link>
        {showEditForm ? (
          <EditForm
            id={comment.id}
            content={comment.content}
            handleCancel={() => setShowEditForm(false)}
            onSuccess={(comment) => {
              setComment(comment);
              setShowEditForm(false);
            }}
          />
        ) : (
          <>
            <p>{comment.content}</p>
            <div>
              <span>
                {pending
                  ? "Posting..."
                  : formatDistanceToNowShort(comment.createdAt)}
              </span>
              {!pending && (
                <>
                  {!comment.isDeleted && (
                    <LikeButton
                      targetId={comment.id}
                      targetType={"COMMENT"}
                      isLiked={comment.likedByMe}
                      onLike={onLike}
                      onUnlike={onUnLike}
                    />
                  )}
                  <button
                    onClick={() => {
                      if (showReplyForm) {
                        focusReplyForm();
                      } else {
                        setShowReplyForm(true);
                      }
                    }}
                  >
                    Reply
                  </button>
                  {auth.user.id === comment.author.id && !comment.isDeleted && (
                    <>
                      <button onClick={() => setShowEditForm(true)}>
                        Edit
                      </button>
                      <button onClick={() => setShowDeleteModal(true)}>
                        Delete
                      </button>
                    </>
                  )}
                  {likeCount > 0 && (
                    <span>
                      {likeCount}
                      <AiOutlineLike />
                    </span>
                  )}
                </>
              )}
            </div>
            {(!disableReplies || pending) && (
              <>
                {replyCount > 0 &&
                  (showReplies ? (
                    <ReplyChain commentId={comment.id} />
                  ) : (
                    <div>
                      <button onClick={() => setShowReplies(true)}>
                        {`View ${replyCount > 1 ? "all " : ""}${replyCount} repl${replyCount === 1 ? "y" : "ies"}`}
                      </button>
                    </div>
                  ))}
              </>
            )}
          </>
        )}
        {children}
        {(showReplyForm || showReplies) && (
          <CommentForm
            postId={comment.postId}
            parentComment={comment}
            setInputRef={setReplyFormRef}
          />
        )}
      </div>
    </>
  );
}

export default Comment;
