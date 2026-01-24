import { useEffect, useRef } from "react";
import useIntersection from "../../hooks/useIntersection";
import Post from "./Post";
// import styles from "./Posts.module.css";

function Posts({ posts, removePost, disableCommentForms = false, fetchNext }) {
  const { ref, isVisible } = useIntersection("50px");
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
        <li key={post.id} ref={index + 1 === posts.length ? ref : undefined}>
          <Post
            post={post}
            removePost={removePost}
            disableCommentForm={disableCommentForms}
          />
        </li>
      ))}
    </ol>
  );
}

export default Posts;
