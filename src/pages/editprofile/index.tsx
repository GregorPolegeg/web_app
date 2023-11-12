import { useSession } from "next-auth/react";
import React, { useState, useEffect, useRef } from "react";

type userSettingsProps = {
  userName: string;
  fileUrl: string;
};

const Index = () => {
  const { data: session } = useSession();
  const [userSettings, setUserSettings] = useState<userSettingsProps | null>(
    null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const newFileUrl = URL.createObjectURL(event.target.files[0]);
      setUserSettings(prevSettings => ({
        userName: prevSettings ? prevSettings.userName : '', 
        fileUrl: newFileUrl,
      }));
    }
  };

  
  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newName = event.target.value;
    setUserSettings(prevSettings => ({
      userName: newName,
      fileUrl: prevSettings ? prevSettings.fileUrl : '',
    }));
  };
  

  const handleSubmit = async () => {
    console.log("Submit", userSettings);
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
                fileUrl: data.parseUserInfo.fileUrl,
              });
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
  <div className="flex justify-center items-center h-screen">
    <form className="text-center">
      <input
        type="text"
        value={userSettings.userName}
        onChange={handleNameChange}
        className="mb-2.5"
      />
      <br />
      <img
        src={userSettings.fileUrl}
        alt="User"
        className="w-37.5 h-37.5 object-cover cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageChange}
        className="hidden"
      />
      <br />
      <button
        type="button"
        onClick={handleSubmit}
        className="mt-2.5"
      >
        Update Settings
      </button>
    </form>
  </div>
);
};

export default Index;
