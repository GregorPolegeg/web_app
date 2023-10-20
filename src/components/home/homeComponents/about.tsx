'getStaticProps'
import React from "react";

const about = () => {
  return (
      <div className="relative h-[720px] w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <h1 className="text-5xl font-bold drop-shadow-xl">Welcome</h1>
          <p className="text-center text-xl">Lorem ipsum dolor sit amet consectetur adipisicing elit. Ducimus, cum fuga ipsum consequuntur id atque illum inventore. Et rem nostrum dolor. Natus nam odit est numquam assumenda delectus id iste.</p>
        </div>
      </div>
  );
};

export default about;
