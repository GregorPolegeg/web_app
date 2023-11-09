import { Controller, useForm } from "react-hook-form";
import { useSocket } from "../providers/socket-provider";
import { VscSend } from "react-icons/vsc";
import { CiCirclePlus } from "react-icons/ci";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
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
  const imageRef = useRef<File| null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      imageRef.current = e.target.files[0];

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setImageLoading(false);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const { socket } = useSocket();
  const { data: session } = useSession();

  const formDataRef = useRef<Object | null>(null);

  const onSubmit = (data: Object) => {
    formDataRef.current = data;
    socket.emit(`isActive`, { conversationId, senderId });
  };

  useEffect(() => {
    if (socket) {
      const sendMessage = async (active: boolean, senderId: string) => {
        if (
          senderId === session?.user.memberId &&
          conversationId !== "" &&
          conversationId !== null
        ) {
          const formData = new FormData();
          if (imageRef.current) {
            formData.append("image", imageRef.current, imageRef.current.name);
          }
          formData.append("senderId", senderId);
          formData.append("conversationId", conversationId);
          formData.append("type", type);
          formData.append("message", JSON.stringify(formDataRef.current));
          formData.append("active", active.toString());

          const response = await fetch("/api/chat/sendMessage", {
            method: "POST",
            body: formData,
          });

          if (response.ok) {
            imageRef.current = null;
            setImagePreview(null);
            const { data } = await response.json();
            socket.emit(`newMessage`, {
              conversationId,
              message: data,
              senderId,
            });
          }
          reset();
        }
      };
      socket.on("responseIsActive", sendMessage);

      return () => {
        socket.off("responseIsActive", sendMessage);
      };
    }
  }, [socket, conversationId, imageRef]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
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
      {imagePreview && (
        <div style={{ width: "50px", height: "50px" }}>
          <img
            src={imagePreview}
            alt="Preview"
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      )}
        <Controller
          name="message"
          control={control}
          defaultValue=""
          rules={{
            validate: (value) =>
              (value && value.length > 0)
                ? true
                : "Please provide a message or an image",
            maxLength: {
              value: 250,
              message: "Message cannot exceed 250 characters",
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
                autoComplete="off"
                placeholder="Type your message"
                className="without-ring w-full rounded-md border-gray-400 p-2 pl-10 shadow-sm focus:shadow-lg"
                disabled={conversationId === "" || conversationId === null}
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
