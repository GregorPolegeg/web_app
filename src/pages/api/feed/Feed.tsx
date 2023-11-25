import React from "react";
import Image from "next/image";
import { AiOutlineLike } from "react-icons/ai";
import { FaRegComment } from "react-icons/fa";

const Feed = () => {
  return (
    <div className="flex w-full justify-center">
      <div className="flex w-full justify-center border-x border-zinc-500 md:min-w-[550px] md:max-w-[550px]">
        <div className="flex w-full flex-col gap-y-2 border-y border-zinc-300 p-7">
          <div className="flex items-center text-zinc-600">
            <Image
              className=" rounded-full"
              width={50}
              height={50}
              src={"/images/avatar_logo.png"}
              alt={"Profile picture"}
            />
            <p className="pl-2">Username</p>
          </div>
          <div>
            <Image
              className=" rounded-md"
              width={550}
              height={550}
              src={"/images/avatar_logo.png"}
              alt={"Profile picture"}
            />
            <p className=" text-sm">
              Lorem ipsum dolor sit amet consectetur, adipisicing elit. Aliquid
              exercitationem illum vitae perspiciatis culpa rerum provident
              voluptas modi similique, iusto aut. Dolore omnis dignissimos
              accusantium enim minima natus! Ea, rerum.
            </p>
            <div className="flex gap-3 pb-1 pt-2 text-2xl ">
              <AiOutlineLike className="duration-150 hover:cursor-pointer hover:text-blue-500" />
              <FaRegComment className="duration-150 hover:cursor-pointer hover:text-blue-500" />
            </div>
            <p className="text-sm text-zinc-500 underline">
              {" "}
              view all 20 comments
            </p>
            <p className="text-zinc-500">133 likes</p>
            <input
              type="text"
              placeholder="Vnesi Drek"
              className="without-ring w-full border-b border-zinc-500 pt-2 pb-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feed;
