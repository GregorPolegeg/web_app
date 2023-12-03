import { useSession } from "next-auth/react";
import React, { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import Circle from "../chat/loadingCircle/circle";
import { CiCirclePlus } from "react-icons/ci";
import { VscSend } from "react-icons/vsc";
import { PostProp } from "./feedProps";
import { useNotification } from "../providers/notification-provider";

interface FormDataProps {
  postTitle: string;
  postDescription: string;
}

type NewPostInputProps = {
  addNewPost: (newPosts: PostProp) => void;
};

const NewPostInput: React.FC<NewPostInputProps> = ({addNewPost}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<File | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { data: session } = useSession();
  const { showNotification } = useNotification();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 25 * 1024 * 1024) {
        alert("File size should not exceed 25MB.");
        return;
      }
      imageRef.current = file;

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setImageLoading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: FormDataProps) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      if (session?.user.memberId) {
        const formData = new FormData();
        if (imageRef.current) {
          formData.append("image", imageRef.current, imageRef.current.name);
        }

        const { postDescription, postTitle } = data;

        formData.append("memberId", session?.user.memberId);
        if(!postTitle){ 
          showNotification("Post title is required","Error");       
          return;
        }
        formData.append("title", postTitle);
        if(!imageRef.current && !postDescription){
          showNotification("Post description or image required","Error");
          return;
        }
        formData.append("description", postDescription);

        xhr.open("POST", "/api/feed/newPost");

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            setUploadProgress(progress);
          }
        };

        xhr.onload = () => {
          if (xhr.status === 200 || xhr.status === 201) {
            try {
              const response = JSON.parse(xhr.responseText);

              imageRef.current = null;
              setImagePreview(null);

              setUploadProgress(0);

              resolve(response);
              reset();
              addNewPost(response.data);
            } catch (error) {
              console.error("Error parsing response:", error);
              reject(error);
            }
          } else {
            console.error("Upload failed:", xhr.statusText);
            reject(new Error("Upload failed: " + xhr.statusText));
          }
        };
        xhr.send(formData);
      }
    });
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormDataProps>();

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
        accept="image/*,video/*"
        style={{ display: "none" }}
        onChange={handleImageChange}
      />
      {imagePreview && (
        <div style={{ position: "relative", width: "50px", height: "50px" }}>
          <img
            src={imagePreview}
            alt="Preview"
            style={{ width: "100%", height: "100%" }}
            className="rounded-3xl object-cover"
          />
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div
              className="rounded-3xl"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Circle />
            </div>
          )}
        </div>
      )}

      <div className="flex items-center">
        <Controller
          name="postDescription"
          control={control}
          defaultValue=""
          rules={{
            validate: (value) =>
              (value && value.length > 0) || imageRef.current
                ? true
                : "Please provide a message or an image",
            maxLength: {
              value: 250,
              message: "Message cannot exceed 250 characters",
            },
          }}
          render={({ field }) => (
            <div className="flex flex-grow items-center gap-2 rounded-md border-gray-400 bg-white p-2 shadow-sm focus:shadow-lg">
              <CiCirclePlus
                onClick={() => document.getElementById("imageUpload")?.click()}
                className="text-2xl hover:cursor-pointer hover:text-zinc-700"
              />
              <input
                {...field}
                ref={inputRef}
                autoComplete="off"
                placeholder="Write a description"
                className="without-ring w-full"
                disabled={uploadProgress > 0 && uploadProgress < 100}
              />
            </div>
          )}
        />
        <VscSend
          onClick={() => {
            handleSubmit(onSubmit)();
            inputRef.current?.focus();
          }}
          className="hover: ml-2 cursor-pointer text-xl"
        />

        <Controller
          name="postTitle"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <input
              {...field}
              ref={inputRef}
              autoComplete="off"
              placeholder="Set a title"
              className="without-ring w-full"
              disabled={uploadProgress > 0 && uploadProgress < 100}
            />
          )}
        />
      </div>
    </form>
  );
};

export default NewPostInput;
