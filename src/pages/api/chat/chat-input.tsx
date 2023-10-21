import { Controller, useForm } from "react-hook-form";
import { useSocket } from "../providers/socket-provider";

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
      body: JSON.stringify({data ,senderId, conversationId, type}),
    });
    if(response.ok){
      const {data} = await response.json();
      socket.emit('sendMessage', {
        data
    })
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
      <Controller
        name="message"
        control={control}
        defaultValue=""
        render={({ field }) => (
          <div className="relative">
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
