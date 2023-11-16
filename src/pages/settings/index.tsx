import { useSession } from "next-auth/react";
import React, { useState, useEffect, useRef } from "react";

type userSettingsProps = {
  userName: string;
  file: File | null;
};

const Index = () => {
  const { data: session } = useSession();
  const [userSettings, setUserSettings] = useState<userSettingsProps | null>(
    null,
  );
  const [imagePreview, setImagePreview] = useState<string>();
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
        if (session?.user.id && userSettings?.file && userSettings?.userName) {
          const formData = new FormData();
          formData.append("userId", session?.user.id ?? "");
          formData.append("userName", userSettings?.userName ?? "");
          formData.append("image", userSettings?.file ?? "");

          console.log(formData);
          xhr.open("POST", "/api/settings/setUserSettings");

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
    if (session?.user.id && session.user.id !== undefined) {
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
    <div className="flex h-screen items-center justify-center">
      <form className="text-center">
        <input
          type="text"
          value={userSettings.userName}
          onChange={handleNameChange}
          className="mb-2.5"
        />
        <br />
        <img
          src={imagePreview}
          alt="User"
          className="max-w- max-h-60 cursor-pointer object-cover"
          onClick={() => fileInputRef.current?.click()}
        />
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageChange}
          className="hidden"
        />
        <br />
        <button type="button" onClick={handleSubmit} className="mt-2.5">
          Update Settings
        </button>
      </form>
    </div>
  );
};

export default Index;
