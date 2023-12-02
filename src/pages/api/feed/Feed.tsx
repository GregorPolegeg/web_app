import React, { useEffect, useState } from "react";
import NewPostInput from "./NewPostInput";
import { useSession } from "next-auth/react";
import { PostProp } from "./feedProps";
import Post from "./Post";
import { useNotification } from "../providers/notification-provider";

const Feed = () => {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<PostProp[]>([]);
  const [postsChanged, setPostsChanged] = useState(false);
  const { showNotification } = useNotification();
  function addNewPost(newPost: PostProp) {
    const updatedPosts = [...posts, newPost];
    setPosts(updatedPosts);
    setPostsChanged(!postsChanged);
  }

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
          showNotification("You have successfuly created a new post","Success");
          setPosts(data);
        } else {
          showNotification("An error has accured while creating a conversation","Error");
          console.error("Failed to get conversations", response);
        }
      } catch (error) {
        console.error("An error occurred:", error);
      }
    };
    getPosts();
  }, [postsChanged]);


  return (
    <div className="flex w-full flex-col items-center justify-center">
      <NewPostInput addNewPost={addNewPost} />
      <div className="flex w-full flex-col justify-center border-x border-zinc-500 md:min-w-[550px] md:max-w-[550px]">
        {posts &&
          posts.map((post) => (
            <Post
              id={post.id}
              title={post.title}
              image={post.image}
              description={post.description}
              postUsername={post.postUsername}
              postUserProfileImage={post.postUserProfileImage}
              likeCount={post.likeCount}
              commentCount={post.commentCount}
              liked={post.liked}
              setPosts={setPosts}
              setPostsChanged={setPostsChanged}
              postsChanged={postsChanged}
              posts={posts}
            />
          ))}
        ;
      </div>
    </div>
  );
};

export default Feed;
