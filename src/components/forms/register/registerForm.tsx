import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { GrMail } from "react-icons/gr";
import { BsFillPersonFill } from "react-icons/bs";
import { AiOutlineEyeInvisible, AiOutlineEye } from "react-icons/ai";
import { IoMdLock } from "react-icons/io";
import { signIn } from "next-auth/react";
import Link from "next/link";

const RegisterForm = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();
  
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordVisible2, setPasswordVisible2] = useState(false);

  const togglePasswordVisibility = () => setPasswordVisible(!passwordVisible);
  const togglePasswordVisibility2 = () =>
    setPasswordVisible2(!passwordVisible2);

  const onSubmit = async (data: Object) => {
    try {
      const response = await fetch("/api/user/register/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        // Navigate to login on successful registration
      } else {
        console.error("Registration failed", response);
        // Handle error or show user feedback
      }
    } catch (error) {
      console.error("An error occurred:", error);
      // Handle error or show user feedback
    }
  };

  return (
    <div className=" flex h-screen w-full items-center justify-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
      <div className="min-w-md rounded-xs max-w-md bg-white p-10 shadow-xl">
        <form className="flex flex-col p-5" onSubmit={handleSubmit(onSubmit)}>
          <h1 className="pb-10 text-center text-4xl font-bold">Register</h1>

          <Controller
            name="email"
            control={control}
            defaultValue=""
            rules={{ required: "Email is required" }}
            render={({ field }) => (
              <div className="relative mb-5">
                <label className="absolute top-1/4 text-xl">
                  <GrMail />
                </label>
                <input
                  {...field}
                  type="email"
                  placeholder="E-Mail"
                  className="without-ring w-full border-b border-gray-400 p-2 pl-8"
                  required
                />
              </div>
            )}
          />
          {/* Similar pattern for other fields... */}
          <Controller
            name="name"
            control={control}
            defaultValue=""
            rules={{ required: "Username is required" }}
            render={({ field }) => (
              <div className="relative mb-5">
                <label className="absolute top-1/4 text-xl">
                  <BsFillPersonFill />
                </label>
                <input
                  {...field}
                  placeholder="Username"
                  className="without-ring w-full border-b border-gray-400 p-2 pl-8"
                  required
                />
              </div>
            )}
          />
          <Controller
            name="password"
            control={control}
            defaultValue=""
            rules={{ required: "Password is required" }}
            render={({ field }) => (
              <div className="relative mb-5">
                <IoMdLock className="absolute top-1/4 text-xl" />
                <input
                  {...field}
                  type={passwordVisible ? "text" : "password"}
                  placeholder="Password"
                  className="without-ring w-full border-b border-gray-400 p-2 pl-8"
                  required
                />
                <span
                  className="absolute right-3 top-1/4 cursor-pointer"
                  onClick={togglePasswordVisibility}
                >
                  {passwordVisible ? (
                    <AiOutlineEyeInvisible />
                  ) : (
                    <AiOutlineEye />
                  )}
                </span>
              </div>
            )}
          />
          <Controller
            name="passwordRepeat"
            control={control}
            defaultValue=""
            rules={{ required: "Please confirm your password" }}
            render={({ field }) => (
              <div className="relative mb-6">
                <IoMdLock className="absolute top-1/4 text-xl" />
                <input
                  {...field}
                  type={passwordVisible2 ? "text" : "password"}
                  placeholder="Repeat password"
                  className="without-ring w-full border-b border-gray-400 p-2 pl-8"
                  required
                />
                <span
                  className="absolute right-3 top-1/4 cursor-pointer"
                  onClick={togglePasswordVisibility2}
                >
                  {passwordVisible2 ? (
                    <AiOutlineEyeInvisible />
                  ) : (
                    <AiOutlineEye />
                  )}
                </span>
              </div>
            )}
          />

          {/* Submit Button */}
          <input
            type="submit"
            value="Submit"
            className="mt-5 cursor-pointer bg-gray-800 px-4 py-2 text-white hover:bg-gray-600"
          />
        </form>

        <p className="w-full p-2 text-center">Or sign in with: </p>
        <div className="flex justify-center pb-2">
          <button
            className="mt-1 cursor-pointer bg-[#DB4437] px-4 py-2 text-white hover:bg-[#f25b4d]"
            onClick={() => signIn("google")}
          >
            <GrMail className="text-xl text-white" />
          </button>
        </div>

        <div className="flex justify-center pb-5">
          <Link href="/login" className="w-full text-center text-blue-700">
            Already have and accout ? LogIn
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
