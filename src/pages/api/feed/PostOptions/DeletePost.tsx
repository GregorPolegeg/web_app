import React from "react";
import { DeletePostProps } from "../feedProps";
import { TbTrash } from "react-icons/tb";

const DeletePost: React.FC<DeletePostProps> = ({ postId, memberId, setPostsChanged, postsChanged}) => {

  async function handleDeletePost() {
    try {
      const response = await fetch("/api/feed/PostOptions/deletePostHandeler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: memberId, postId }),
      });
      if (response.ok) {
        const data = await response.json();
        setPostsChanged(!postsChanged);
      } else {
        console.error("Failed to get conversations", response);
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }
  return (
    <div>
      <TbTrash className=" hover:cursor-pointer text-xl" onClick={() => handleDeletePost()} />
    </div>
  );
};

export default DeletePost;
