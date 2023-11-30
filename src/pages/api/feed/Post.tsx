import React, { useState } from "react";
import { CommentProps, PostComponentProps } from "./feedProps";
import { FaRegComment } from "react-icons/fa";
import NewCommentInput from "./NewCommentInput";

import Image from "next/image";
import Like from "./Like";
import { useSession } from "next-auth/react";
import DeletePost from "./PostOptions/DeletePost";

const Post: React.FC<PostComponentProps> = ({
  id,
  title,
  postUsername,
  image,
  postUserProfileImage,
  likeCount,
  liked,
  commentCount,
  description,
  setPosts,
  setPostsChanged,
  postsChanged,
  posts,
}) => {
  const { data: session } = useSession();
  const [comments, setComments] = useState<CommentProps[]>([]);

  function handleLikeCount(postId: string, add: boolean) {
    setPosts((currentPosts) => {
      const postIndex = currentPosts.findIndex((post) => post.id === postId);
      if (postIndex === -1) return currentPosts;

      const updatedPosts = currentPosts.map((post, index) => {
        if (index === postIndex) {
          return {
            ...post,
            likeCount: add
              ? post.likeCount + 1
              : Math.max(0, post.likeCount - 1),
            liked: add,
          };
        }
        return post;
      });

      return updatedPosts;
    });
  }

  function addComment(newComment: CommentProps) {
    const updatedComments = [...comments, newComment];
    setComments(updatedComments);
  }

  async function getComments(postId: string) {
    try {
      const response = await fetch("/api/feed/getComments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: session?.user.memberId, postId }),
      });
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      } else {
        console.error("Failed to get conversations", response);
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }

  return (
    <div
      key={id}
      className="flex w-full flex-col gap-y-2 border-y border-zinc-300 p-7"
    >
      <div className="flex items-center text-zinc-600">
        <Image
          className="rounded-full"
          width={50}
          height={50}
          src={`/${postUserProfileImage ?? "images/avatar_logo.png"}`}
          alt={"Profile picture"}
        />
        <p className="pl-2">{postUsername}</p>
        {postUsername === session?.user.name ? (
          <DeletePost postId={id} memberId={session?.user.memberId ?? ""} setPostsChanged={setPostsChanged} postsChanged={postsChanged}/>
        ) : null}
      </div>
      <h3 className="text-lg font-bold">{title}</h3>
      <div>
        {image ? (
          <Image
            className="rounded-md"
            width={550}
            height={550}
            src={`/${image}`}
            alt={"Profile picture"}
          />
        ) : (
          ""
        )}
        <p className=" text-sm">{description}</p>
        <div className="flex gap-3 pb-1 pt-2 text-2xl ">
          <Like handleLikeCount={handleLikeCount} postId={id} liked={liked} />
          <FaRegComment className="duration-150 hover:cursor-pointer hover:text-blue-500" />
        </div>
        <p
          className="text-sm text-zinc-500 underline hover:cursor-pointer"
          onClick={() => getComments(id)}
        >
          view all {commentCount} comments
        </p>
        <p className="text-zinc-500">{likeCount} Likes</p>
        <div className="mt-4">
          {comments
            .filter((comment) => comment.postId === id)
            .map((comment) => (
              <div key={comment.id} className="mt-2">
                <strong>{comment.userName}:</strong> {comment.comment}
              </div>
            ))}
        </div>
        <NewCommentInput postId={id} addComment={addComment} />
      </div>
    </div>
  );
};

export default Post;
