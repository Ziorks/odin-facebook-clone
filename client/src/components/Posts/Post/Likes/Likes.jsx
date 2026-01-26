import { useEffect, useRef, useState } from "react";
import { AiOutlineLike } from "react-icons/ai";
import useDataFetchPaginated from "../../../../hooks/useDataFetchPaginated";
import useIntersection from "../../../../hooks/useIntersection";
import UserThumbnail from "../../../UserThumbnail";
import Modal from "../../../Modal";
import styles from "./Likes.module.css";

function LikesModal({ handleClose, myLike, useLikes }) {
  const {
    data: likes,
    setData: setLikes,
    isLoading,
    error,
    fetchNext,
  } = useLikes;
  const { ref, isVisible } = useIntersection("20px");
  const fetchNextRef = useRef(fetchNext);

  useEffect(() => {
    if (likes !== null) return;
    fetchNextRef.current();
  }, [likes]);

  useEffect(() => {
    if (!myLike || likes === null) return;

    const myLikeIndex = likes.findIndex((like) => like.id === myLike.id);
    if (myLikeIndex >= 0) {
      setLikes((prev) => prev.toSpliced(myLikeIndex, 1));
    }
  }, [myLike, likes, setLikes]);

  useEffect(() => {
    fetchNextRef.current = fetchNext;
  }, [fetchNext]);

  useEffect(() => {
    if (isVisible) {
      fetchNextRef.current();
    }
  }, [isVisible]);

  return (
    <Modal handleClose={handleClose}>
      <h2>Likes</h2>
      {likes && (
        <ul className={styles.modalList}>
          {myLike && (
            <li>
              <UserThumbnail user={myLike.user} />
            </li>
          )}
          {likes.length > 0 &&
            likes.map((like, index) => (
              <li
                key={like.id}
                ref={index + 1 === likes.length ? ref : undefined}
              >
                <UserThumbnail user={like.user} />
              </li>
            ))}
        </ul>
      )}
      {isLoading && <p>Loading...</p>}
      {error && (
        <p>
          An error occurred. <button onClick={fetchNext}>Try again</button>
        </p>
      )}
    </Modal>
  );
}

function LikesSample({ nLikes, myLike, useLikesSample }) {
  const {
    data: likesSample,
    setData: setLikesSample,
    isLoading,
    error,
    fetchNext,
  } = useLikesSample;
  const fetchNextRef = useRef(fetchNext);

  useEffect(() => {
    if (likesSample !== null) return;
    fetchNextRef.current();
  }, [likesSample]);

  useEffect(() => {
    if (!myLike || likesSample === null) return;

    const myLikeIndex = likesSample.findIndex((like) => like.id === myLike.id);
    if (myLikeIndex >= 0) {
      setLikesSample((prev) => prev.toSpliced(myLikeIndex, 1));
    }
  }, [myLike, likesSample, setLikesSample]);

  const nMoreLikes = nLikes - likesSample?.length - (myLike ? 1 : 0);

  return (
    <div className={styles.samplePopup}>
      {likesSample && (
        <>
          <ul className={styles.sampleList}>
            {myLike && <li>{myLike.user.username}</li>}
            {likesSample.length > 0 &&
              likesSample.map((like) => (
                <li key={like.id}>{like.user.username}</li>
              ))}
          </ul>
          {nMoreLikes > 0 && <p>and {nMoreLikes} more... </p>}
        </>
      )}
      {isLoading && <p>Loading...</p>}
      {error && <p>An error occurred.</p>}
    </div>
  );
}

function Likes({ nLikes, myLike, path }) {
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [showLikesSample, setShowLikesSample] = useState(false);
  const useLikes = useDataFetchPaginated(path, { disableFetchOnMount: true });
  const useLikesSample = useDataFetchPaginated(path, {
    disableFetchOnMount: true,
    resultsPerPage: 19,
  });
  const timeout = useRef(null);

  const openPopup = () => {
    if (timeout.current) {
      clearTimeout(timeout.current);
      timeout.current = null;
    }

    setShowLikesSample(true);
  };
  const closePopup = () => {
    timeout.current = setTimeout(() => setShowLikesSample(false), 600);
  };

  return (
    <>
      {showLikesModal && (
        <LikesModal
          handleClose={() => setShowLikesModal(false)}
          myLike={myLike}
          useLikes={useLikes}
        />
      )}
      {nLikes > 0 && (
        <div
          className={styles.hoverContainer}
          onMouseEnter={openPopup}
          onMouseLeave={closePopup}
        >
          <button onClick={() => setShowLikesModal(true)}>
            {nLikes}
            <AiOutlineLike />
          </button>
          {showLikesSample && (
            <LikesSample
              nLikes={nLikes}
              myLike={myLike}
              useLikesSample={useLikesSample}
            />
          )}
        </div>
      )}
    </>
  );
}

export default Likes;
