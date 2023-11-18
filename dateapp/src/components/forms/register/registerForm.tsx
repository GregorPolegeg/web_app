import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { GrMail } from "react-icons/gr";
import { BsFillPersonFill } from "react-icons/bs";
import { AiOutlineEyeInvisible, AiOutlineEye } from "react-icons/ai";
import { IoMdLock } from "react-icons/io";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormInputField } from "~/pages/api/form/InputField/InputField";

const RegisterForm = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const router = useRouter();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordVisible2, setPasswordVisible2] = useState(false);

  const togglePasswordVisibility = () => setPasswordVisible(!passwordVisible);
  const togglePasswordVisibility2 = () =>
    setPasswordVisible2(!passwordVisible2);

  const [serverError, setServerError] = useState("");

  const onSubmit = async (data: Object) => {
    try {
      const response = await fetch("/api/user/register/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        router.push("../login");
      } else {
        if (!response.ok) {
          const errorData = await response.json();
          setServerError(errorData.message);
        }
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  return (
    <div className=" flex h-screen w-full items-center justify-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
      <div className="min-w-md rounded-xs max-w-md bg-white p-10 shadow-xl">
        <form className="flex flex-col p-5" onSubmit={handleSubmit(onSubmit)}>
          <h1 className="pb-10 text-center text-4xl font-bold">Register</h1>
          {serverError && <p className="text-red-500">{serverError}</p>}
          <FormInputField
            control={control}
            name="email"
            rules={{ required: "Email is required" }}
            type="email"
            placeholder="E-Mail"
            icon={<GrMail />}
          />
          {/* Similar pattern for other fields... */}
          <FormInputField
            control={control}
            name="name"
            rules={{ required: "Username is required" }}
            placeholder="Username"
            icon={<BsFillPersonFill />}
          />
          <FormInputField
            control={control}
            name="password"
            rules={{
              required: "Password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters long",
              },
              pattern: {
                value: /^(?=.*[A-Z])(?=.*\d)/,
                message:
                  "Password must contain at least one uppercase letter and one number",
              },
            }}
            type="password"
            placeholder="Password"
            icon={<IoMdLock />}
            toggleVisibility={togglePasswordVisibility}
            isVisible={passwordVisible}
          />

          <FormInputField
            control={control}
            name="passwordRepeat"
            rules={{ required: "Please confirm your password" }}
            type="password"
            placeholder="Repeat password"
            icon={<IoMdLock />}
            toggleVisibility={togglePasswordVisibility2}
            isVisible={passwordVisible2}
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
