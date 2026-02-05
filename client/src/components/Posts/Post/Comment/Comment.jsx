import { useCallback, useContext, useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AuthContext from "../../../../contexts/AuthContext";
import PostContext from "../../../../contexts/PostContext";
import useApiPrivate from "../../../../hooks/useApiPrivate";
import {
  formatDistanceToNowShort,
  getDuplicatesRemovedMerged,
} from "../../../../utils/helperFunctions";
import Modal from "../../../Modal";
import ImagePreview from "../../../ImagePreview";
import Likes from "../Likes";
import LikeButton from "../LikeButton";
import CommentForm from "../CommentForm";
import styles from "./Comment.module.css";

const STATUS = {
  OK: 1,
  LOADING: 2,
  ERROR: 3,
};

function Replies({
  comment,
  parentIdChain,
  idWhitelist,
  setComment,
  onFetchSuccess,
}) {
  const api = useApiPrivate();
  const { toggleDetailsModal } = useContext(PostContext);

  const [status, setStatus] = useState(STATUS.OK);
  const page = useRef(1);

  const fetchNext = () => {
    setStatus(STATUS.LOADING);

    api
      .get(
        `/comments/${comment.id}/replies?page=${page.current}&resultsPerPage=10`,
      )
      .then((resp) => {
        const { results } = resp.data;
        setComment((prev) => ({
          ...prev,
          replies: prev.replies
            ? getDuplicatesRemovedMerged(prev.replies, results)
            : results,
        }));
        setStatus(STATUS.OK);
        page.current++;
        onFetchSuccess?.();
      })
      .catch((err) => {
        console.error("replies fetch error", err);
        setStatus(STATUS.ERROR);
      });
  };

  const replyCount = comment._count.replies;

  return (
    <>
      {comment.replies?.length > 0 && (
        <ol className={styles.replyChain}>
          {comment.replies.map((reply) => (
            <li key={reply.pendingId ? `p_${reply.pendingId}` : reply.id}>
              <Comment
                comment={reply}
                parentIdChain={[...parentIdChain, comment.id]}
                idWhitelist={idWhitelist}
              />
            </li>
          ))}
        </ol>
      )}
      {status === STATUS.OK &&
        (idWhitelist && replyCount > 1 && !comment.parentId ? (
          <button onClick={toggleDetailsModal}>
            View all {replyCount} replies
          </button>
        ) : (
          replyCount > (comment.replies?.length || 0) &&
          (!comment.replies ? (
            <div>
              <button onClick={fetchNext}>
                {replyCount > 1
                  ? `View all ${replyCount} replies`
                  : "View 1 reply"}
              </button>
            </div>
          ) : (
            <div>
              <button onClick={fetchNext}>View more replies</button>
            </div>
          ))
        ))}
      {status === STATUS.LOADING && <p>Loading replies...</p>}
      {status === STATUS.ERROR && (
        <p>
          An error occurred <button onClick={fetchNext}>Try again</button>
        </p>
      )}
    </>
  );
}

function EditForm({ comment, handleCancel, onSuccess }) {
  const [content, setContent] = useState(comment.content ?? "");
  const [imageUrl, setImageUrl] = useState(comment.mediaUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const api = useApiPrivate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const payload = {};
    if (content.trim()) payload.content = content;
    if (imageUrl) payload.imageUrl = imageUrl;

    api
      .put(`/comments/${comment.id}`, payload)
      .then((resp) => {
        onSuccess?.(resp.data.comment);
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
      <textarea onChange={(e) => setContent(e.target.value)} value={content} />
      {imageUrl && (
        <ImagePreview
          imageUrl={imageUrl}
          handleRemove={() => setImageUrl(null)}
        />
      )}
      <div>
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={isLoading || (!content && !imageUrl)}
        >
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
      .then((resp) => {
        onSuccess?.(resp.data.comment);
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
  comment,
  parentIdChain = [],
  disableReplies = false,
  idWhitelist,
}) {
  const { auth } = useContext(AuthContext);
  const { useComments, addPendingIdToWhitelist } = useContext(PostContext);
  const { setData: setComments } = useComments;

  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [hasFetchedReplies, setHasFetchedReplies] = useState(false);

  const replyFormRef = useRef();
  const setReplyFormRef = useCallback((node) => {
    replyFormRef.current = node;
  }, []);

  useEffect(() => {
    focusReplyForm();
  }, [showReplyForm]);

  const focusReplyForm = () => {
    if (!replyFormRef.current) return;
    replyFormRef.current.focus();
  };

  if (
    idWhitelist &&
    !(
      idWhitelist.ids.includes(comment.id) ||
      idWhitelist.pendingIds.includes(comment.pendingId)
    )
  )
    return;

  const pending =
    Object.hasOwn(comment, "pendingId") && !Object.hasOwn(comment, "id");

  const setComment = (value) => {
    function getEditedComments(commentsArr, parentIds) {
      //No parent? -> this comment is in the commentsArr
      if (parentIds.length === 0) {
        //map comments and replace this comment with value
        const comments = commentsArr.map((c) => {
          if (c.id === comment.id) {
            if (typeof value === "function") return value(c);
            return value;
          }

          return c;
        });
        //return edited commentsArr
        return comments;
      }

      //else return comments arr with looking for comment in next level
      return commentsArr.map((c) => {
        if (c.id === parentIds[0]) {
          return {
            ...c,
            replies: getEditedComments(c.replies, parentIds.slice(1)),
          };
        }
        return c;
      });
    }

    setComments((prev) => getEditedComments(prev, parentIdChain));
  };

  const getFormattedComment = (oldComment, newComment) => {
    const result = { ...newComment };
    if (Object.hasOwn(oldComment, "replies"))
      result.replies = oldComment.replies;
    if (Object.hasOwn(oldComment, "pendingId"))
      result.pendingId = oldComment.pendingId;
    return result;
  };

  const onDeleteSuccess = (deletedComment) => {
    setComment((prev) => getFormattedComment(prev, deletedComment));
    setShowDeleteModal(false);
  };

  const onEditSuccess = (editedComment) => {
    setComment((prev) => getFormattedComment(prev, editedComment));
    setShowEditForm(false);
  };

  const onLikeSuccess = (like) => {
    setComment((prev) => {
      const updatedComment = {
        ...prev,
        _count: {
          ...prev._count,
          likes: prev._count.likes + (like ? 1 : -1),
        },
        myLike: like,
      };
      return getFormattedComment(prev, updatedComment);
    });
  };

  const onReplySubmit = (pendingReply) => {
    setComment((prev) => ({
      ...prev,
      replies: prev.replies ? [pendingReply, ...prev.replies] : [pendingReply],
    }));

    if (idWhitelist) addPendingIdToWhitelist(pendingReply.pendingId);
  };

  const onReplyError = (pendingReply, error) => {
    setComment((prev) => ({
      ...prev,
      replies: prev.replies.map((reply) => {
        if (reply.pendingId === pendingReply.pendingId) {
          return { ...pendingReply, error };
        }
        return reply;
      }),
    }));
  };

  const onReplyPosted = (postedReply) => {
    setComment((prev) => ({
      ...prev,
      replies: prev.replies.map((reply) => {
        if (reply.pendingId === postedReply.pendingId) {
          return postedReply;
        }
        return reply;
      }),
      _count: { ...prev._count, replies: prev._count.replies + 1 },
    }));
  };

  return (
    <>
      {showDeleteModal && (
        <DeleteModal
          id={comment.id}
          handleClose={() => setShowDeleteModal(false)}
          onSuccess={onDeleteSuccess}
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
            comment={comment}
            handleCancel={() => setShowEditForm(false)}
            onSuccess={onEditSuccess}
          />
        ) : (
          <>
            {comment.content !== null && (
              <p className={styles.commentContent}>{comment.content}</p>
            )}
            {comment.mediaUrl !== null && (
              <img className={styles.commentMedia} src={comment.mediaUrl} />
            )}
            <div>
              <span>
                {comment.error
                  ? "Error: comment not posted"
                  : pending
                    ? "Posting..."
                    : formatDistanceToNowShort(comment.createdAt)}
              </span>
              {!pending && !comment.error && (
                <>
                  {!comment.isDeleted && (
                    <LikeButton
                      like={comment.myLike}
                      likePath={`comments/${comment.id}/like`}
                      onSuccess={onLikeSuccess}
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
                  <Likes
                    nLikes={comment._count.likes}
                    myLike={comment.myLike}
                    path={`/comments/${comment.id}/likes`}
                  />
                </>
              )}
            </div>
          </>
        )}
        {!disableReplies && !pending && !comment.error && (
          <Replies
            comment={comment}
            parentIdChain={parentIdChain}
            idWhitelist={idWhitelist}
            setComment={setComment}
            onFetchSuccess={() => setHasFetchedReplies(true)}
          />
        )}
        {(showReplyForm || hasFetchedReplies) && (
          <CommentForm
            postId={comment.postId}
            parentComment={comment}
            setInputRef={setReplyFormRef}
            onSubmit={onReplySubmit}
            onError={onReplyError}
            onSuccess={onReplyPosted}
          />
        )}
      </div>
    </>
  );
}

export default Comment;
