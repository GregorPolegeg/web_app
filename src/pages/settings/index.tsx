import { signIn, useSession } from "next-auth/react";
import React, { useState, useEffect, useRef } from "react";
import Circle from "../api/chat/loadingCircle/circle";

type userSettingsProps = {
  userName: string;
  file: File | null;
};

const Index = () => {
  const { data: session, update } = useSession();
  const [userSettings, setUserSettings] = useState<userSettingsProps | null>(
    null,
  );
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];

      setUserSettings((prevSettings) => ({
        userName: prevSettings ? prevSettings.userName : "",
        file: file,
      }));

      const newFileUrl = URL.createObjectURL(file);
      setImagePreview(newFileUrl);
    }
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newName = event.target.value;
    setUserSettings((prevSettings) => ({
      userName: newName,
      file: prevSettings ? prevSettings.file : null,
    }));
  };

  const handleSubmit = async () => {
    if (session) {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        if (session?.user.id && userSettings?.userName) {
          const formData = new FormData();
          formData.append("userId", session?.user.id ?? "");
          formData.append("userName", userSettings?.userName ?? "");
          if(userSettings?.file)
          formData.append("image", userSettings?.file ?? "");

          xhr.open("POST", "/api/settings/setUserSettings");

          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const progress = (event.loaded / event.total) * 100;
              setUploadProgress(progress);
            }
          };

          xhr.onload = () => {
            if (xhr.status === 200 || xhr.status === 201) {
              update({ name: userSettings.userName })
              try {
                const response = JSON.parse(xhr.responseText);
                setUploadProgress(0);

                resolve(response);
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
    }
  };

  useEffect(() => {
    if (session?.user.id && session.user.id !== undefined && imagePreview === "") {
      async function getUserSettings() {
        try {
          const response = await fetch("/api/settings/getUserSettings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: session?.user.id,
            }),
          });
          if (response.ok) {
            const data = await response.json();
            if (data && data.parseUserInfo) {
              setUserSettings({
                userName: data.parseUserInfo.userName,
                file: null,
              });
              setImagePreview(data.parseUserInfo.fileUrl);
            }
          }
        } catch (error) {
          console.error(
            "An error occurred while fetching direct messages:",
            error,
          );
        }
      }
      getUserSettings();
    }
  }, [session]);

  if (!userSettings) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen items-center justify-center ">
      <form className="flex flex-col items-center gap-7 rounded-2xl bg-zinc-200 px-10 pb-10 pt-7 text-center shadow-xl">
        <h1 className="text-3xl">Settings</h1>
        <div className="relative">
          <img onClick={() => fileInputRef.current?.click()} src={imagePreview} className="max-h-40 max-w-[160px] cursor-pointer rounded-full object-cover" alt="Preview" />
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div
              className="rounded-full"
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
        <input
          type="text"
          value={userSettings.userName}
          onChange={handleNameChange}
          className="without-ring min-w-[250px] rounded-2xl bg-zinc-300 p-2 "
        />
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={handleSubmit}
          className="rounded-2xl bg-blue-600 p-3 font-semibold text-white"
        >
          Update Settings
        </button>
      </form>
    </div>
  );
};

export default Index;
