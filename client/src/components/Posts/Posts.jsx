import { useEffect, useRef } from "react";
import useIntersection from "../../hooks/useIntersection";
import Post from "./Post";
// import styles from "./Posts.module.css";

function Posts({ posts, fetchNext }) {
  const { ref, isVisible } = useIntersection("100px");
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
        <li ref={index + 1 === posts.length ? ref : undefined} key={post.id}>
          <Post post={post} />
        </li>
      ))}
    </ol>
  );
}

export default Posts;
