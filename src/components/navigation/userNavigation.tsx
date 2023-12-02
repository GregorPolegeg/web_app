import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AiOutlineAppstore,
} from "react-icons/ai";
import { signIn, signOut, useSession } from "next-auth/react";
import { IoHomeOutline } from "react-icons/io5";
import { TbMessages } from "react-icons/tb";

enum SelectedProps {
  home,
  messages,
  o1,
  o2,
}

const UserNavigation = () => {
  const { data: sessionData } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SelectedProps>();

  const normalClass =
    "hover:bg-zinc-300 rounded-lg py-3 md:px-10 md:py-3 flex-1 flex justify-center";
  if (sessionData?.user.id) {
    return (
      <>
        <nav className="z-10 md:z-0 fixed bottom-0 flex w-full flex-row items-center justify-center bg-zinc-200 shadow-sm md:bottom-auto md:top-0 md:flex-row md:justify-between md:bg-white md:px-7 md:py-0">
          {/* Logo */}
          <div className="hidden md:flex ">
            <Image width={55} height={55} src="/images/logo.png" alt="Logo" />
          </div>

          {/* Desktop Menu */}
          <div className="no-highlight flex w-full items-center rounded-md text-[25px] md:w-auto md:text-2xl">
            <Link
              href="/"
              className={`${normalClass}`}
              onClick={() => setSelectedItem(SelectedProps.home)}
            >
              <IoHomeOutline />
            </Link>
            <Link
              href="/messages/t"
              className={`${normalClass}`}
              onClick={() => setSelectedItem(SelectedProps.messages)}
            >
              <TbMessages />
            </Link>
            <Link
              href="/"
              className={`${normalClass}`}
              onClick={() => setSelectedItem(SelectedProps.o1)}
            >
              <AiOutlineAppstore />
            </Link>
            <Link
              href="/settings"
              className={`${normalClass}`}
              onClick={() => setSelectedItem(SelectedProps.o2)}
            >
              <Image
                width={30}
                height={30}
                className="rounded-full"
                src={`/${sessionData?.user.image ?? "images/avatar_logo.png"}`}
                alt={"profile image"}
              />
            </Link>
          </div>

          {/* Desktop Login */}
          <div className="hidden text-xl font-bold md:flex">
            {!sessionData ? (
              <Link href="/login">Login</Link>
            ) : (
              <button onClick={() => void signOut()}>
                {sessionData.user.name}
              </button>
            )}
          </div>
        </nav>
      </>
    );
  }else{
    return null
  }
};

export default UserNavigation;
