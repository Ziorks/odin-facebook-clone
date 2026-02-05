import { useContext, useEffect, useRef } from "react";
import PostContext from "../../../../contexts/PostContext";
import useIntersection from "../../../../hooks/useIntersection";
import Comment from "../Comment";
import styles from "./Comments.module.css";

function Comments({ setCommentListRef, idWhitelist }) {
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
        (idWhitelist
          ? idWhitelist.ids.length > 0 || idWhitelist.pendingIds.length > 0
          : true) &&
        (comments.length > 0 ? (
          <ol className={styles.commentsList} ref={setCommentListRef}>
            {comments.map((comment, index) => {
              if (
                idWhitelist &&
                !(
                  idWhitelist.ids.includes(comment.id) ||
                  idWhitelist.pendingIds.includes(comment.pendingId)
                )
              )
                return;

              return (
                <li
                  key={
                    comment.pendingId ? `p_${comment.pendingId}` : comment.id
                  }
                  ref={index + 1 === comments.length ? visibleRef : undefined}
                >
                  <Comment comment={comment} idWhitelist={idWhitelist} />
                </li>
              );
            })}
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
