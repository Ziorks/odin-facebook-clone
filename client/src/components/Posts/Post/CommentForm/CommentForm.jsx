import { useContext } from "react";
import AuthContext from "../../../../contexts/AuthContext";
import PostContext from "../../../../contexts/PostContext";
import useApiPrivate from "../../../../hooks/useApiPrivate";
import TextAndImageForm from "../../../TextAndImageForm";

function CommentForm({
  parentComment = null,
  setInputRef,
  onSubmit,
  onError,
  onSuccess,
}) {
  const { auth } = useContext(AuthContext);
  const { post, pendingIdCounterRef } = useContext(PostContext);
  const api = useApiPrivate();

  const handleSubmit = (content, file, imageUrl) => {
    const formData = new FormData();

    formData.append("postId", post.id);
    if (parentComment?.id) {
      formData.append("parentId", parentComment.id);
    }
    if (content) {
      formData.append("content", content);
    }
    if (file) {
      formData.append("image", file);
    } else if (imageUrl) {
      formData.append("imageUrl", imageUrl);
    }

    const pendingId = pendingIdCounterRef.current++;
    const pendingComment = {
      author: auth.user,
      pendingId,
    };

    formData.entries().forEach((entry) => {
      const [key, value] = entry;
      if (key === "image") return (pendingComment[key] = imageUrl);
      pendingComment[key] = +value || value;
    });

    onSubmit?.(pendingComment);

    api
      .post("/comments", formData)
      .then((resp) => {
        const { comment } = resp.data;
        onSuccess?.({ ...comment, pendingId });
      })
      .catch((err) => {
        console.error("comment creation error", err);
        onError?.(pendingComment, err);
      });
  };

  const imageInputId = `image-upload_${post.id}_${parentComment?.id || "x"}`;
  const placeholderText = parentComment
    ? `Reply to ${parentComment.author.username}`
    : `Comment as ${auth.user.username}`;

  return (
    <TextAndImageForm
      handleSubmit={handleSubmit}
      imageInputId={imageInputId}
      placeholderText={placeholderText}
      charLimit={500}
      setInputRef={setInputRef}
    />
  );
}

export default CommentForm;
