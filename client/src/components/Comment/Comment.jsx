import { useCallback, useContext, useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AiOutlineLike } from "react-icons/ai";
import AuthContext from "../../contexts/AuthContext";
import useApiPrivate from "../../hooks/useApiPrivate";
import { formatDistanceToNowShort } from "../../utils/helperFunctions";
import LikeButton from "../LikeButton";
import CommentForm from "../CommentForm";
import Modal from "../Modal";
import styles from "./Comment.module.css";

function ReplyChain({ replies }) {
  return (
    <ol className={styles.replyChain}>
      {replies.map((reply) => (
        <li key={reply.id}>
          <Comment comment={reply} />
        </li>
      ))}
    </ol>
  );
}

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
      .put(`/comments/${id}`, { content: formContent })
      .then((resp) => onSuccess?.(resp.data.comment))
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
      .put(`/comments/${id}/delete`)
      .then((resp) => onSuccess?.(resp.data.comment))
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
  const api = useApiPrivate();

  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [comment, setComment] = useState(commentObj);
  const [replies, setReplies] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const replyFormRef = useRef();
  const setReplyFormRef = useCallback((node) => {
    replyFormRef.current = node;
  }, []);

  useEffect(() => {
    focusReplyForm();
  }, [showReplyForm]);

  const likeCount = comment._count?.likes;
  const replyCount = comment._count?.replies;

  const focusReplyForm = () => {
    if (!replyFormRef.current) return;
    replyFormRef.current.focus();
  };

  const handleGetReplies = () => {
    setError(null);
    setIsLoading(true);

    api
      .get(`/comments/${comment.id}/replies`)
      .then((resp) => {
        setReplies(resp.data.replies);
      })
      .catch((err) => {
        setError(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
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
                      liked={comment.likedByMe}
                      onLike={() =>
                        setComment((prev) => ({
                          ...prev,
                          _count: {
                            ...prev._count,
                            likes: prev._count.likes + 1,
                          },
                        }))
                      }
                      onUnlike={() =>
                        setComment((prev) => ({
                          ...prev,
                          _count: {
                            ...prev._count,
                            likes: prev._count.likes - 1,
                          },
                        }))
                      }
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
            {(!disableReplies || pending) &&
              (replies ? (
                <ReplyChain replies={replies} />
              ) : (
                replyCount > 0 && (
                  <div>
                    <button onClick={handleGetReplies}>
                      {`View ${replyCount} repl${replyCount === 1 ? "y" : "ies"}`}
                    </button>
                    {isLoading && <p>Loading replies...</p>}
                    {error && <p>{error}</p>}
                  </div>
                )
              ))}
          </>
        )}
        {children}
        {(showReplyForm || replies) && (
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
