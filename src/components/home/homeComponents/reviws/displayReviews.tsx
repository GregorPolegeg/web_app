import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { AiOutlineLike, AiOutlineDislike } from "react-icons/ai";

interface Review {
  name: string;
  date: string;
  ratingSupport: number;
  ratingPrice: number;
  ratingQuality: number;
  content: string;
}

const renderStars = (rating: number) => {
  const maxStars = 5;
  const filledStars = Math.min(Math.round(rating), maxStars);

  return (
    <div className="flex">
      {Array.from({ length: maxStars }, (_, index) => (
        <span
          key={index}
          className={`text-2xl ${
            index < filledStars ? "text-yellow-500" : "text-gray-300"
          }`}
        >
          &#9733; {/* Unicode star character */}
        </span>
      ))}
    </div>
  );
};

const DisplayReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/user/getReviews/route");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data: Review[] = await response.json();
        setReviews(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  // Slider settings
  const settings = {
    dots: true,
    infinite: true,
    speed: 2000,
    autoplaySpeed: 2000,
    slidesToShow: 3,
    slidesToScroll: 1,
    swipeToSlide: true,
    swipe: true,
    touchMove: true,
    autoplay: true,
    pauseOnHover: true,
  };

  if (reviews.length === 0) {
    return (
      <>
        <h1 className="pt-3 text-center text-5xl font-bold text-black">
          Reviews
        </h1>
        <p>Loading...</p>
      </>
    );
  }

  return (
    <>
      <h1 className="pt-3 text-center text-5xl font-bold text-black">
        Reviews
      </h1>
      <div className="md:overflow flex justify-center overflow-hidden pt-10">
        <div className="max-w-7xl">
          <Slider {...settings}>
            {reviews.map((review, index) => (
              <div
                key={index}
                className="max-h-[350px] w-[250px] rounded-lg p-7 shadow-lg"
              >
                <h3 className="text-base font-bold">{review.name}</h3>
                <h4 className="pb-2 text-sm ">{review.date}</h4>
                <div className="py-2">
                  <p className="flex items-center text-base font-bold">
                    Support:{" "}
                    <span className="ml-2">
                      {renderStars(review.ratingSupport)}
                    </span>
                  </p>
                  <p className="flex items-center text-base font-bold">
                    Price:{" "}
                    <span className="ml-2">
                      {renderStars(review.ratingPrice)}
                    </span>
                  </p>
                  <p className="flex items-center text-base font-bold">
                    Quality:{" "}
                    <span className="ml-2">
                      {renderStars(review.ratingQuality)}
                    </span>
                  </p>
                </div>

                <p className="text-sm">{review.content}</p>
                <div className="flex w-full justify-center gap-[40px] py-3 text-2xl">
                  <AiOutlineLike />
                  <AiOutlineDislike />
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </>
  );
};

export default DisplayReviews;
