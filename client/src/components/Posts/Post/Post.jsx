import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import AuthContext from "../../../contexts/AuthContext";
import PostContext from "../../../contexts/PostContext";
import useApiPrivate from "../../../hooks/useApiPrivate";
import useDataFetchPaginated from "../../../hooks/useDataFetchPaginated";
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
  const { toggleDetailsModal, useComments, onPostComment } =
    useContext(PostContext);
  const { setData: setComments } = useComments;
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

  const onCommentSubmit = (pendingComment) => {
    setComments((prev) => [pendingComment, ...prev]);
  };

  const onCommentError = (pendingComment, error) => {
    setComments((prev) =>
      prev.map((comment) => {
        if (comment.pendingId === pendingComment.pendingId) {
          return { ...pendingComment, error };
        }
        return comment;
      }),
    );
  };

  const onCommentPosted = (postedComment) => {
    setComments((prev) =>
      prev.map((comment) => {
        if (comment.pendingId === postedComment.pendingId) {
          return postedComment;
        }
        return comment;
      }),
    );
    onPostComment();
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
            onSubmit={onCommentSubmit}
            onError={onCommentError}
            onSuccess={onCommentPosted}
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
  const useComments = useDataFetchPaginated(`/posts/${post.id}/comments`, {
    disableFetchOnChange: true,
  });
  const hasMounted = useRef(false);

  useEffect(() => {
    //add top comment to comments arr on mount
    if (hasMounted.current) return;
    hasMounted.current = true;

    if (!postObj.topComment) return;

    const newComment = { ...postObj.topComment };
    if (newComment.reply) {
      newComment.replies = [newComment.reply];
      delete newComment.reply;
    }

    useComments.setData([newComment]);
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

  const toggleDetailsModal = () => {
    setShowPostDetails((prev) => !prev);
  };
  const toggleDeleteModal = () => {
    setShowDeleteModal((prev) => !prev);
  };

  const topComment =
    postObj.topComment &&
    useComments.data?.find((c) => c.id === postObj.topComment.id);

  return (
    <PostContext.Provider
      value={{
        post,
        setPost,
        onPostLikeChange,
        onPostComment,
        onPostEdit,
        onPostDelete,
        toggleDetailsModal,
        toggleDeleteModal,
        useComments,
      }}>
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
        {!disableComments && (
          <>
            {topComment && (
              <>
                {/* TODO: below will be if(topComment || newComments.length > 0)*/}
                {post._count.comments > 1 && (
                  <button onClick={toggleDetailsModal}>
                    View more comments
                  </button>
                )}
                <Comment comment={topComment} disableReplies={true}>
                  {/*TODO: below isn't working quite right
                    I want to display the reply supplied from server if there is exactly 1; otherwise show 'view more' btn that toggles modal
                    I also want to display new replies made outside of modal regardless of reply count

                    MAIN IDEA: comments made in modal should not appear here
                  */}
                  {postObj.topComment.reply && (
                    <>
                      {topComment.replies.map((r) => {
                        if (
                          (postObj.topComment._count.replies < 2 &&
                            r.id === postObj.topComment.reply.id) ||
                          (Object.hasOwn(r, "pendingId") &&
                            Object.hasOwn(r, "id"))
                        ) {
                          return (
                            <Comment
                              key={r.id}
                              comment={r}
                              disableReplies={true}
                              parentIdChain={[postObj.topComment.id]}
                            />
                          );
                        }
                      })}
                      {postObj.topComment._count.replies > 1 && (
                        <div>
                          <button onClick={toggleDetailsModal}>
                            {`View ${topComment._count.replies} replies`}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </Comment>
              </>
            )}
            <CommentForm />
          </>
        )}
      </div>
    </PostContext.Provider>
  );
}

export default Post;
