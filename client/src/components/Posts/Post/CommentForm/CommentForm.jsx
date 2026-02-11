import { useContext } from "react";
import AuthContext from "../../../../contexts/AuthContext";
import PostContext from "../../../../contexts/PostContext";
import useApiPrivate from "../../../../hooks/useApiPrivate";
import { MAX_UPLOAD_SIZE_COMMENT } from "../../../../utils/constants";
import TextAndImageForm from "../../../TextAndImageForm";

function CommentForm({
  apiPostPath,
  placeholderText,
  setInputRef,
  onSubmit,
  onError,
  onSuccess,
}) {
  const { auth } = useContext(AuthContext);
  const { pendingIdCounterRef } = useContext(PostContext);
  const api = useApiPrivate();

  const handleSubmit = (content, file, imageUrl) => {
    const formData = new FormData();

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
      .post(apiPostPath, formData)
      .then((resp) => {
        const { comment } = resp.data;
        onSuccess?.({ ...comment, pendingId });
      })
      .catch((err) => {
        console.error("comment creation error", err);
        onError?.(pendingComment, err);
      });
  };

  return (
    <TextAndImageForm
      handleSubmit={handleSubmit}
      placeholderText={placeholderText}
      charLimit={500}
      maxFilesize={MAX_UPLOAD_SIZE_COMMENT}
      setInputRef={setInputRef}
    />
  );
}

export default CommentForm;
