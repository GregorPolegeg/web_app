import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { AiOutlineLike } from "react-icons/ai";

type LikeProp = {
  postId: string;
  liked: boolean;
  handleLikeCount: any;
};

async function handleLike(memberId: string, postId: string, setLikeStyle: any, handleLikeCount: any) {
  try {
    const response = await fetch("/api/feed/handleLike", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId: memberId, postId }),
    });
    if (response.ok) {
      const data = await response.json();
      if (data.data == true) {
        handleLikeCount(postId, true);
      } else {
        handleLikeCount(postId, false);
      }
    } else {
      console.error("Failed to get conversations", response);
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

const Like: React.FC<LikeProp> = ({ postId, liked, handleLikeCount }) => {
  const { data: session } = useSession();

  const [likeStyle, setLikeStyle] = useState<string>();

  useEffect(() => {
    if (liked) {
      setLikeStyle(
        "duration-150 hover:cursor-pointer hover:text-blue-200 text-blue-500",
      );
    } else {
      setLikeStyle("duration-150 hover:cursor-pointer hover:text-blue-500");
    }
  }, [liked]);

  return (
    <div>
      <AiOutlineLike
        onClick={() => handleLike(session?.user.memberId ?? "", postId, setLikeStyle, handleLikeCount)}
        className={likeStyle}
      />
    </div>
  );
};

export default Like;
