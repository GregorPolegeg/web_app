import { Controller, useForm } from "react-hook-form";
import { useSocket } from "../providers/socket-provider";
import { VscSend } from "react-icons/vsc";
import { CiCirclePlus } from "react-icons/ci";
import { useState } from "react";
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
      body: JSON.stringify({ data, senderId, conversationId, type, image: selectedImage }),
    });
    if (response.ok) {
      const { data } = await response.json();
      socket.emit(`newMessage`, { conversationId, message: data});
    }

    // After submitting, reset the form fields.
    reset();
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset, // Destructure the reset function
  } = useForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
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
          render={({ field }) => (
            <div className="relative flex-grow">
              <CiCirclePlus 
              onClick={() => document.getElementById('imageUpload')?.click()}
              className="hover:text-zinc-700 absolute left-2 top-1/2 -translate-y-1/2 transform text-2xl" />
              <input
                {...field}
                placeholder="Type your message"
                className="without-ring w-full rounded-md border-gray-400 p-2 pl-10 shadow-sm focus:shadow-lg"
              />
            </div>
          )}
        />
        <VscSend className="ml-2 text-xl hover:shadow-md" />
      </div>
    </form>
  );
};
