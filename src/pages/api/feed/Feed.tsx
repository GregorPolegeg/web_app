import React, { useEffect, useState } from "react";
import Image from "next/image";
import { AiOutlineLike } from "react-icons/ai";
import { FaRegComment } from "react-icons/fa";
import NewPostInput from "./NewPostInput";
import { useSession } from "next-auth/react";
import Like from "./Like";

type PostProp = {
  id: string;
  title: string;
  image: string;
  description: string;
  postUsername: string;
  postUserProfileImage: string;
  likeCount: number;
  commentCount: number;
  liked: boolean;
};

const Feed = () => {
  const { data: session } = useSession();

  const [posts, setPosts] = useState<PostProp[]>();

  useEffect(() => {
    const getPosts = async () => {
      try {
        const response = await fetch("/api/feed/getPosts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ memberId: session?.user.memberId }),
        });
        if (response.ok) {
          const data = await response.json();
          setPosts(data);
        } else {
          console.error("Failed to get conversations", response);
        }
      } catch (error) {
        console.error("An error occurred:", error);
      }
    };
    getPosts();
  }, [session]);

  function handleLikeCount(postId: string, add: boolean) {
    setPosts((currentPosts) => {
      if (currentPosts) {
        const postIndex = currentPosts.findIndex((post) => post.id === postId);
        if (postIndex === -1) return currentPosts; // If post not found, return current state

        // Clone the array for immutability
        const updatedPosts: PostProp[] = [...currentPosts];

        // Increment or decrement the like count
        if (postIndex !== undefined && updatedPosts !== undefined) {
          console.log(updatedPosts[postIndex]?.likeCount);
          if (add) {
            updatedPosts[postIndex].likeCount += 1;
            updatedPosts[postIndex].liked = true; // Set liked to tr
            console.log(updatedPosts[postIndex]?.likeCount);
          } else {
            updatedPosts[postIndex].likeCount = Math.max(
              0,
              updatedPosts[postIndex].likeCount - 1,
            );
            updatedPosts[postIndex].liked = false; // Set liked to false
          }

          return updatedPosts;
        }
      }
    });
  }

  return (
    <div className="flex w-full justify-center">
      <NewPostInput />
      <div className="flex w-full flex-col justify-center border-x border-zinc-500 md:min-w-[550px] md:max-w-[550px]">
        {posts &&
          posts.map((post) => (
            <div
              key={post.id}
              className="flex w-full flex-col gap-y-2 border-y border-zinc-300 p-7"
            >
              <div className="flex items-center text-zinc-600">
                <Image
                  className=" rounded-full"
                  width={50}
                  height={50}
                  src={`/${
                    post.postUserProfileImage ?? "images/avatar_logo.png"
                  }`}
                  alt={"Profile picture"}
                />
                <p className="pl-2">{post.postUsername}</p>
              </div>
              <div>
                <Image
                  className=" rounded-md"
                  width={550}
                  height={550}
                  src={`/${post.image}`}
                  alt={"Profile picture"}
                />
                <p className=" text-sm">{post.description}</p>
                <div className="flex gap-3 pb-1 pt-2 text-2xl ">
                  <Like handleLikeCount={handleLikeCount} postId={post.id} liked={post.liked} />
                  <FaRegComment className="duration-150 hover:cursor-pointer hover:text-blue-500" />
                </div>
                <p className="text-sm text-zinc-500 underline">
                  {" "}
                  view all {post.commentCount} comments
                </p>
                <p className="text-zinc-500">{post.likeCount} Likes</p>
                <input
                  type="text"
                  placeholder="Your comment"
                  className="without-ring w-full border-b border-zinc-500 pb-1 pt-2"
                />
              </div>
            </div>
          ))}
        ;
      </div>
    </div>
  );
};

export default Feed;
