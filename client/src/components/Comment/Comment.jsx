import { useContext, useState } from "react";
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
      .then(() => onSuccess(formContent))
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
      .then(onSuccess)
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
  comment,
  pending = false,
  disableReplies = false,
}) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [content, setContent] = useState(comment.content);
  const [likes, setLikes] = useState(comment._count?.likes);
  const [isDeleted, setIsDeleted] = useState(comment.isDeleted);
  const [replies, setReplies] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { auth } = useContext(AuthContext);
  const api = useApiPrivate();

  const replyCount = comment._count?.replies;

  const handleGetReplies = () => {
    setError(null);
    setIsLoading(true);

    api
      .get(`/comments/${comment.id}/replies`)
      .then((resp) => {
        setReplies(resp.data.replies);
        setShowReplyForm(true);
      })
      .catch((err) => {
        setError(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  if (isDeleted && replyCount < 1) return;

  return (
    <>
      {showDeleteModal && (
        <DeleteModal
          id={comment.id}
          handleClose={() => setShowDeleteModal(false)}
          onSuccess={() => {
            setIsDeleted(true);
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
            content={content}
            handleCancel={() => setShowEditForm(false)}
            onSuccess={(content) => {
              setContent(content);
              setShowEditForm(false);
            }}
          />
        ) : (
          <>
            <p>{isDeleted ? "[deleted]" : content}</p>
            {!isDeleted && (
              <div>
                <span>
                  {pending
                    ? "Posting..."
                    : formatDistanceToNowShort(comment.createdAt)}
                </span>
                {!pending && (
                  <>
                    <LikeButton
                      targetId={comment.id}
                      targetType={"COMMENT"}
                      liked={comment.likedByMe}
                      onLike={() => setLikes((prev) => prev + 1)}
                      onUnlike={() => setLikes((prev) => prev - 1)}
                    />
                    <button
                      onClick={() => {
                        setShowReplyForm(true);
                        //TODO: focus reply form
                      }}
                    >
                      Reply
                    </button>
                    {auth.user.id === comment.author.id && (
                      <>
                        <button onClick={() => setShowEditForm(true)}>
                          Edit
                        </button>
                        <button onClick={() => setShowDeleteModal(true)}>
                          Delete
                        </button>
                      </>
                    )}
                    {likes > 0 && (
                      <span>
                        {likes}
                        <AiOutlineLike />
                      </span>
                    )}
                  </>
                )}
              </div>
            )}
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
        {showReplyForm && (
          <CommentForm postId={comment.postId} parentComment={comment} />
        )}
      </div>
    </>
  );
}

export default Comment;
