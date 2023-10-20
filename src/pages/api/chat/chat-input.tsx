"use client";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { type } from "os";
interface ChatInputProps {
  senderId: string;
  conversationId: string;
  type: "conversation" | "channel";
}

const onSubmit = async (data: Object) => {
    console.log(data);
    const response = await fetch("/api/user/register/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });   
}

export const ChatInput = ({senderId ,conversationId ,type }: ChatInputProps) => {
    const {
        control,
        handleSubmit,
        formState: { errors },
      } = useForm();
    return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="message"
        control={control}
        defaultValue=""
        render={({ field }) => (
          <div className="relative mb-5">
            <input
              {...field}
              placeholder="Text"
              className="without-ring w-full border-b border-gray-400 p-2 pl-8"
            />
          </div>
        )}
      />
    </form>
  );
};
