import { Controller, useForm } from "react-hook-form";
import { useSocket } from "../providers/socket-provider";
import { VscSend } from "react-icons/vsc";
import { CiCirclePlus } from "react-icons/ci";
import { useRef, useState } from "react";
import e from "cors";
interface ChatInputProps {
  senderId: string;
  conversationId: string;
  type: "conversation" | "channel";
}

export const ChatInput = ({
  senderId,
  conversationId,
  type,
}: ChatInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const { socket } = useSocket();
  const onSubmit = async (data: Object) => {
    const response = await fetch("/api/chat/sendMessage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data,
        senderId,
        conversationId,
        type,
        image: selectedImage,
      }),
    });
    if (response.ok) {
      const { data } = await response.json();
      socket.emit(`newMessage`, { conversationId, message: data });
    }
    reset();
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset, // Destructure the reset function
  } = useForm();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(onSubmit)();
      }}
    >
      <input
        type="file"
        id="imageUpload"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleImageChange}
      />

      <div className="flex items-center">
        <Controller
          name="message"
          control={control}
          defaultValue=""
          rules={{
            validate: (value) =>
              (value && value.length > 0) || selectedImage
                ? true
                : "Please provide a message or an image",
            maxLength: {
              value: 250,
              message: "Message can not exceed 250 characters",
            },
          }}
          render={({ field }) => (
            <div className="relative flex-grow">
              <CiCirclePlus
                onClick={() => document.getElementById("imageUpload")?.click()}
                className="absolute left-2 top-1/2 -translate-y-1/2 transform text-2xl hover:cursor-pointer hover:text-zinc-700"
              />
              <input
                {...field}
                ref={inputRef}
                placeholder="Type your message"
                className="without-ring w-full rounded-md border-gray-400 p-2 pl-10 shadow-sm focus:shadow-lg"
              />
            </div>
          )}
        />
        <VscSend
          onClick={() => {
            handleSubmit(onSubmit)();
            inputRef.current?.focus();
          }}
          className="ml-2 text-xl"
        />
      </div>
    </form>
  );
};
