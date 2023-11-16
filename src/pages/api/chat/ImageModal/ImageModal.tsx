import React, { useState } from "react";
import Image from "next/image";

type ImageModalProps = {
  className?: string;
  url: string;
  alt?: string;
};

const ImageModal = ({ className, url, alt }: ImageModalProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => {
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  return (
    <>
      <Image
        width={256}
        height={256}
        src={url}
        alt={alt ?? ""}
        onClick={openModal}
        className={`${className} cursor-pointer`}
      />
      {isOpen && (
        <div
          className="z-2 fixed left-0 top-0 flex h-full w-full flex-col items-center justify-center bg-black bg-opacity-95"
          onClick={closeModal}
        >
          <img src={url} alt="" className="relative max-h-[90%] max-w-[90%]" />

          <button
            onClick={closeModal}
            className="absolute right-2 top-2  m-2 rounded-full text-2xl text-white"
          >
            X
          </button>
        </div>
      )}
    </>
  );
};

export default ImageModal;
