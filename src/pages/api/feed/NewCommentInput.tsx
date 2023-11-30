import { useSession } from "next-auth/react";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { CommentProps } from "./feedProps";

type FormDataProps = {
  comment: string;
};

type NewCommentInputProps = {
    postId: string;
    addComment: (newComment: CommentProps) => void;
};

const NewCommentInput: React.FC<NewCommentInputProps> = ({postId, addComment}) => {
  const { data: session } = useSession();

  const onSubmit = async (data: FormDataProps) => {
    reset();
    try {
      const response = await fetch("/api/feed/newComment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: session?.user.memberId, postId, comment: data.comment }),
      });
      if (response.ok) {
        const data = await response.json();
        addComment(data.data);
      } else {
        console.error("Failed to get conversations", response);
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormDataProps>();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(onSubmit)();
      }}
    >
      <Controller
        name="comment"
        control={control}
        defaultValue=""
        render={({ field }) => (
          <input
            {...field}
            autoComplete="off"
            placeholder="Add comment"
            className="without-ring w-full border-b border-zinc-500 pb-1 pt-2"
          />
        )}
      />
    </form>
  );
};

export default NewCommentInput;
