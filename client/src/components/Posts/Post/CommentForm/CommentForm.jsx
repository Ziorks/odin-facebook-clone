import { useState, useContext } from "react";
import useApiPrivate from "../../../../hooks/useApiPrivate";
import AuthContext from "../../../../contexts/AuthContext";
import PostContext from "../../../../contexts/PostContext";
import Comment from "../Comment";
// import styles from "./CommentForm.module.css";

function CommentForm({ parentComment = null, setInputRef, onSuccess }) {
  const { post, onPostChange } = useContext(PostContext);
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState(null);
  const [postedComment, setPostedComment] = useState(null);
  const api = useApiPrivate();
  const { auth } = useContext(AuthContext);

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors(null);

    api
      .post("/comments", {
        content,
        postId: post.id,
        parentId: parentComment?.id || null,
      })
      .then((resp) => {
        const comment = resp.data.comment;
        setPostedComment(comment);
        onSuccess?.();
        onPostChange();
      })
      .catch((err) => {
        console.error("comment creation error", err);

        if (err.response?.status === 400) {
          setErrors(err.response.data.errors);
        } else {
          setErrors([
            { msg: err.response?.data?.message || "Something went wrong." },
          ]);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <>
      {postedComment ? (
        <Comment comment={postedComment} />
      ) : (
        <>
          {isLoading ? (
            <Comment
              pending={true}
              comment={{
                content,
                postId: post.id,
                author: auth.user,
              }}
            />
          ) : (
            <>
              {errors && (
                <ul>
                  {errors.map((error, i) => (
                    <li key={i}>{error.msg}</li>
                  ))}
                </ul>
              )}
              <form onSubmit={handleCommentSubmit}>
                <textarea
                  ref={setInputRef}
                  placeholder={
                    parentComment
                      ? `Reply to ${parentComment.author.username}`
                      : `Comment as ${auth.user.username}`
                  }
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
                <div>
                  <button type="submit" disabled={!content || isLoading}>
                    Post
                  </button>
                </div>
              </form>
            </>
          )}
        </>
      )}
    </>
  );
}

export default CommentForm;
