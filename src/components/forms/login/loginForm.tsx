import React, { useState } from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { GrMail } from "react-icons/gr";
import { AiOutlineEyeInvisible, AiOutlineEye } from "react-icons/ai";
import { IoMdLock } from "react-icons/io";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { redirect, useRouter } from "next/navigation";

interface FormData {
  email: string;
  password: string;
};

const LoginForm = () => {
  const router = useRouter();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const [passwordVisible, setPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => setPasswordVisible(!passwordVisible);

  const onSubmit = async (data: FormData) => {
    try {
      const signInData = await signIn('credentials', {
        redirect: false,
        email: data.email,
        password: data.password,
        callbackUrl: "/"
      });

      if (signInData?.error) {
        console.log(signInData.error);
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("Sign-in error:", error);
    }
  };

  return (
    <div className=" flex h-screen w-full items-center justify-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
      <div className="min-w-md rounded-xs max-w-md bg-white p-10 shadow-xl">
        <form className="flex flex-col p-5" onSubmit={handleSubmit(onSubmit)}>
          <h1 className="pb-10 text-center text-4xl font-bold">Login</h1>

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
          <Link href="/register" className="w-full text-center text-blue-700">
            Don't have an account? Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
