import React, { useState } from "react";
import Image from "next/image";
import Link from 'next/link';
import { AiOutlineClose } from 'react-icons/ai'
import { signIn, signOut, useSession } from "next-auth/react";

const navContent = {
  User: [{name:"Home",route:"/"}, {name:"About",route:"/"}, {name:"Reviews",route:"/"}, {name:"Plans",route:"/"}, {name:"Contacts",route:"/"}],
  LogedUser: [{name:"Messages",route:"/messages/t"},{name:"Form",route:"/messages/t"},{name:"Support",route:"/messages/t"}, {name:"Contacts",route:"/messages/t"}],
};


const UserNavigation = () => {
  const { data: sessionData } = useSession(); 
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  let userNavItems = navContent["User"];

  if(sessionData?.user){
    userNavItems = navContent["LogedUser"];
  }

  return (
    <>
      <nav className="px-7 shadow-sm md:py-0 fixed top-0 flex w-full items-center justify-between bg-white md:flex-row flex-row">
        {/* Logo */}
        <div className="flex p-1">
          <Image
            width={56}
            height={56}
            src="/images/logo.png"
            alt="Logo"
          />
        </div>

        {/* Desktop Menu */}
        <ul className="hidden md:flex">
          {userNavItems.map((item, index) => (
            <li key={index} className="transition duration-150 hover:bg-gray-300 hover:cursor-pointer text-l p-5 font-normal">
              <Link href={item.route}>{item.name}</Link>
            </li>
          ))}
        </ul>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center justify-end">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
            </svg>
          </button>
        </div>

        {/* Desktop Login */}
        <div className="hidden md:flex text-xl font-bold">
          {!sessionData? (<Link href="/login">Login</Link>): (<button onClick={() => void signOut() }>{sessionData.user.name}</button>)}
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="fixed top-0 left-0 w-full h-full bg-white p-5 transition-transform transform-gpu z-20">
            {/* Close Button */}
            <button onClick={() => setIsMenuOpen(false)} className="text-3xl absolute top-4 right-4">
              <AiOutlineClose/>
            </button>

            {/* Logo */}
            <div className="flex justify-start items-center mb-8">
              <Image
                width={56}
                height={56}
                src="https://cdn.worldvectorlogo.com/logos/sc-spelle-venhaus.svg"
                alt="Logo"
              />
            </div>

            {/* Menu Items */}
            <ul className="mt-8 flex flex-col items-center">
              {userNavItems.map((item, index) => (
                <li key={index} className="transition text-center w-full duration-150 hover:bg-gray-300 hover:cursor-pointer text-l py-2 font-bold">
                  <Link href={item.route}>{item.name}</Link>
                </li>
              ))}
            </ul>

            {/* Login */}
            <div className="flex justify-center text-center mt-8 text-l font-normal">
            {!sessionData? (
              <div>
                <Link href="/login">Login</Link>
                <p className="px-5">|</p>
                <Link href="/register">Register</Link>
              </div>
              ) : (<button onClick={() => void signOut()}>LogOut</button>)}
              
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default UserNavigation;