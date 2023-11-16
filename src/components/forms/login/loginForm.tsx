import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { GrMail } from "react-icons/gr";
import { AiOutlineEyeInvisible, AiOutlineEye } from "react-icons/ai";
import { IoMdLock } from "react-icons/io";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { FormInputField } from "~/pages/api/form/InputField/InputField";

interface FormData {
  email: string;
  password: string;
}

const LoginForm = () => {
  const router = useRouter();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [signInError, setSignInError] = useState("");

  const togglePasswordVisibility = () => setPasswordVisible(!passwordVisible);

  const onSubmit = async (data: FormData) => {
    try {
      const signInData = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
        callbackUrl: "/",
      });

      if (signInData?.error) {
        setSignInError(signInData.error);
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("Sign-in error:", error);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
      <div className="w-[420px] rounded-xs max-w-lg bg-white p-10 shadow-xl">
        <form className="flex flex-col p-5" onSubmit={handleSubmit(onSubmit)}>
          <h1 className="pb-10 text-center text-4xl font-bold">Login</h1>

          {/* Sign-In Error Message */}
          {signInError && (
            <p className="text-center text-red-500">{signInError}</p>
          )}
          {/* Email Field */}
          <FormInputField
            control={control}
            name="email"
            rules={{ required: "Email is required" }}
            type="email"
            placeholder="E-Mail"
            icon={<GrMail />}
          />

          {/* Password Field */}
          <FormInputField
            control={control}
            name="password"
            rules={{ required: "Password is required" }}
            type="password"
            placeholder="Password"
            icon={<IoMdLock />}
            toggleVisibility={togglePasswordVisibility}
            isVisible={passwordVisible}
          />

          {/* Submit Button */}
          <input
            type="submit"
            value="Submit"
            className="mt-5 cursor-pointer bg-gray-800 px-4 py-2 text-white hover:bg-gray-600"
          />
        </form>

        {/* Additional Sign-In Options */}
        <p className="w-full p-2 text-center">Or sign in with: </p>
        <div className="flex justify-center pb-2">
          <button
            className="mt-1 cursor-pointer bg-[#DB4437] px-4 py-2 text-white hover:bg-[#f25b4d]"
            onClick={() => signIn("google")}
          >
            <GrMail className="text-xl text-white" />
          </button>
        </div>

        {/* Registration Link */}
        <div className="flex justify-center pb-5">
          <Link className="text-blue-700" href="/register">
            Don't have an account? Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
