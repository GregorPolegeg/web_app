import { useSession } from "next-auth/react";
import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { AiOutlineClose } from "react-icons/ai";

interface Ratings {
  support: number;
  price: number;
  quality: number;
}

interface NewReviewProps {
  onClose: () => void; // Function to close the NewReview component
}

const NewReview: React.FC<NewReviewProps> = ({ onClose }) => {
  const { data: session } = useSession();
  const user = session?.user;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [ratings, setRatings] = useState<Ratings>({
    support: 0,
    price: 0,
    quality: 0,
  });

  const handleStarClick = (category: keyof Ratings, clickedRating: number) => {
    setRatings((prev) => ({
      ...prev,
      [category]: clickedRating === prev[category] ? 0 : clickedRating,
    }));
  };

  const onSubmit = async (data: Object) => {
    if (ratings.price === 0 || ratings.support === 0 || ratings.quality === 0) {
    } else {
      try {
        const response = await fetch("/api/user/newReview/route", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user: user, data, ratings }),
        });
        if (response.ok) {
          // Navigate to login on successful registration
        } else {
          console.error("Registration failed", response);
          // Handle error or show user feedback
        }
      } catch (error) {
        console.error("An error occurred:", error);
        // Handle error or show user feedback
      }
    }
  };

  return (
    <div className="flex w-full items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-50 blur-md filter"></div>
      <div className="absolute left-1/2 top-1/2 z-10 w-full -translate-x-1/2 -translate-y-1/2 transform bg-white p-10 md:w-[500px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <h2 className="text-center text-3xl font-bold text-black">
            New Review
          </h2>
          <button
            onClick={onClose}
            className="absolute top-2 right-2 p-2 text-lg cursor-pointer"
          >
            <AiOutlineClose/>
          </button>
          <div className="flex flex-col">
            <Controller
              name="content"
              control={control}
              defaultValue=""
              rules={{ required: "Content is required" }}
              render={({ field }) => (
                <div className="relative mb-5">
                  <label className="absolute top-1/4 left-2 text-xl">
                    {/* You might want to add an icon here */}
                  </label>
                  <input
                    {...field}
                    type="text"
                    placeholder="Your review..."
                    className="without-ring w-full border-b-2 border-black pt-10 p-2"
                    required
                  />
                </div>
              )}
            />

            {(["support", "price", "quality"] as const).map((category) => (
              <div key={category} className="mt-3">
                <label className="mb block text-lg font-semibold">
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </label>
                {Array.from({ length: 5 }).map((_, index) => (
                  <span
                    key={index}
                    className={`cursor-pointer text-2xl ${
                      index < ratings[category]
                        ? "text-yellow-500"
                        : "text-gray-300"
                    }`}
                    onClick={() => handleStarClick(category, index + 1)}
                  >
                    ★
                  </span>
                ))}
              </div>
            ))}

            <input
              type="submit"
              value="Submit"
              className="mt-5 cursor-pointer bg-gray-800 px-4 py-2 text-white hover:bg-gray-600"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewReview;
