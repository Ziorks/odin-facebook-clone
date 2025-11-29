import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { AiOutlineLike } from "react-icons/ai";
import { format } from "date-fns";
import AuthContext from "../../contexts/AuthContext";
import useApiPrivate from "../../hooks/useApiPrivate";
import LikeButton from "../LikeButton";
import Modal from "../Modal";
import styles from "./Post.module.css";

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
      .put(`/posts/${id}`, { content: formContent })
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
      .delete(`/posts/${id}`)
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
      <p>Are you sure you want to delete this post forever?</p>
      <div>
        <button onClick={handleDelete} disabled={isLoading}>
          DELETE
        </button>
        <button onClick={handleClose} disabled={isLoading}>
          Cancel
        </button>
      </div>
      {isLoading && <p>Deleting post...</p>}
      {error && <p>An error occured. Please try again.</p>}
    </Modal>
  );
}

function Post({
  post,
  onLike,
  onUnlike,
  onEdit,
  onDelete,
  toggleDetailsModal,
}) {
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { auth } = useContext(AuthContext);

  return (
    <>
      {showDeleteModal && (
        <DeleteModal
          id={post.id}
          handleClose={() => setShowDeleteModal(false)}
          onSuccess={() => {
            onDelete();
            setShowDeleteModal(false);
          }}
        />
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
        <EditForm
          id={post.id}
          content={post.content}
          handleCancel={() => setShowEditForm(false)}
          onSuccess={(content) => {
            onEdit(content);
            setShowEditForm(false);
          }}
        />
      ) : (
        <>
          <p>{post.content}</p>
          <div>
            {post._count.likes > 0 && (
              <span>
                {post._count.likes}
                <AiOutlineLike />
              </span>
            )}
            {post._count.comments > 0 && (
              <button onClick={toggleDetailsModal}>
                {`${post._count.comments} comment${post._count.comments > 1 ? "s" : ""}`}
              </button>
            )}
          </div>
          <div>
            <LikeButton
              targetId={post.id}
              liked={post.likedByMe}
              targetType={"POST"}
              onLike={onLike}
              onUnlike={onUnlike}
            />
            <button onClick={toggleDetailsModal}>Comment</button>
            {auth.user.id === post.author.id && (
              <>
                <button onClick={() => setShowEditForm(true)}>Edit</button>
                <button onClick={() => setShowDeleteModal(true)}>Delete</button>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
}

export default Post;
