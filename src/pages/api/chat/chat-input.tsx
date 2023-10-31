import { Controller, useForm } from "react-hook-form";
import { useSocket } from "../providers/socket-provider";
import { VscSend } from "react-icons/vsc";
import { CiCirclePlus } from "react-icons/ci";
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
  const { socket } = useSocket();
  const onSubmit = async (data: Object) => {
    const response = await fetch("/api/chat/sendMessage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data, senderId, conversationId, type }),
    });
    if (response.ok) {
      const { data } = await response.json();
      socket.emit(`newMessage`, { conversationId, message: data });
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
      <div className="flex items-center">
        <Controller
          name="message"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <div className="relative flex-grow">
              <CiCirclePlus className="absolute left-2 top-1/2 -translate-y-1/2 transform text-2xl" />
              <input
                {...field}
                placeholder="Type your message"
                className="without-ring w-full rounded-md border-gray-400 p-2 pl-10 shadow-sm focus:shadow-lg"
              />
            </div>
          )}
        />
        <VscSend className="ml-2 text-xl" />
      </div>
    </form>
  );
};
