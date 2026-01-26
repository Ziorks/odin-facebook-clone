import { useContext, useEffect, useRef, useState } from "react";
import PostContext from "../../../../contexts/PostContext";
import useIntersection from "../../../../hooks/useIntersection";
import Comment from "../Comment";
import CommentForm from "../CommentForm";
import styles from "./Comments.module.css";

function Comments({ setCommentListRef, setCommentFormRef }) {
  const { useComments } = useContext(PostContext);
  const [isCommentPosted, setIsCommentPosted] = useState(false);
  const { data: comments, isLoading, error, fetchNext } = useComments;
  const { ref: visibleRef, isVisible } = useIntersection("100px");
  const fetchNextRef = useRef(fetchNext);

  useEffect(() => {
    if (comments !== null) return;
    fetchNextRef.current();
  }, [comments]);

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
        (comments.length > 0 ? (
          <ol className={styles.commentsList} ref={setCommentListRef}>
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
          <>{!isCommentPosted && <p>No comments yet</p>}</>
        ))}
      {isLoading && <p>Loading comments...</p>}
      {error && (
        <p>
          An error occured <button onClick={fetchNext}>Try again</button>
        </p>
      )}
      <CommentForm
        setInputRef={setCommentFormRef}
        onSuccess={() => setIsCommentPosted(true)}
      />
    </>
  );
}

export default Comments;
