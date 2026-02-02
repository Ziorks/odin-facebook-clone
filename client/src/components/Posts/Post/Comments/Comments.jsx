import { useContext, useEffect, useRef } from "react";
import PostContext from "../../../../contexts/PostContext";
import useIntersection from "../../../../hooks/useIntersection";
import Comment from "../Comment";
import styles from "./Comments.module.css";

function Comments({ setCommentListRef }) {
  const { useComments } = useContext(PostContext);
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
                key={comment.pendingId ? `p_${comment.pendingId}` : comment.id}
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

export default Comments;
