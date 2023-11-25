import { useState } from "react";
import { IoCheckmarkSharp } from "react-icons/io5";
enum SubscriptionsProps {
  day,
  week,
  month,
}

const Subscriptions = () => {
  const [selectedSubscription, setSelectedSubscription] =
    useState<SubscriptionsProps>(SubscriptionsProps.month);
  return (
    <div className="flex h-full items-center justify-center bg-gradient-to-t from-sky-500 to-sky-100">
      <div className=" no-highlight min-w-[370px] drop-shadow-2xl">
        <div className="rounded-lg rounded-b-none bg-white p-6 pb-0">
          <div className="flex justify-center bg-white font-semibold text-black ">
            <button
              onClick={() => setSelectedSubscription(SubscriptionsProps.day)}
              className={` duration-700 ${
                selectedSubscription === SubscriptionsProps.day
                  ? "bg-sky-200"
                  : "bg-white"
              } rounded-l-3xl flex-1  py-2  text-blue-500  hover:bg-sky-200`}
            >
              DAY
            </button>
            <button
              onClick={() => setSelectedSubscription(SubscriptionsProps.week)}
              className={`duration-700 ${
                selectedSubscription === SubscriptionsProps.week
                  ? "bg-sky-200"
                  : "bg-white"
              }  py-2 flex-1  text-blue-500  hover:bg-sky-200`}
            >
              WEEK
            </button>
            <button
              onClick={() => setSelectedSubscription(SubscriptionsProps.month)}
              className={` duration-700 ${
                selectedSubscription === SubscriptionsProps.month
                  ? "bg-sky-200"
                  : "bg-white"
              } rounded-r-3xl flex-1  text-blue-500  hover:bg-sky-200`}
            >
              MONTH
            </button>
          </div>
          <div className="flex items-center justify-center gap-2 py-8 ">
            <h3 className="text-3xl">$</h3>
            <h2 className="text-6xl font-semibold">
              {selectedSubscription === SubscriptionsProps.month
                ? "59.99"
                : selectedSubscription === SubscriptionsProps.day
                ? "2.99"
                : "21.99"}
            </h2>
            <h3 className="text-xl text-zinc-500">/day</h3>
          </div>
        </div>
        <div className="flex max-w-[420px] flex-col gap-3 rounded-b-lg bg-gray-100 p-6 pb-5">
          <div className="flex flex-col gap-3 pb-6">
            <div className="flex items-center gap-1">
              <IoCheckmarkSharp className="text-2xl text-green-500" />
              <p>24/7 support</p>
            </div>
            <div className="flex items-center gap-1">
              <IoCheckmarkSharp className="text-2xl text-green-500" />
              <p>Ask any questions</p>
            </div>
            <div className="flex items-center gap-1">
              <IoCheckmarkSharp className="text-2xl text-green-500" />
              <p>Anonimity</p>
            </div>
            <div className="flex items-center gap-1">
              <IoCheckmarkSharp className="text-2xl text-green-500" />
              <p>Relaxed inviroment</p>
            </div>
            <div className="flex items-center gap-1">
              <IoCheckmarkSharp className="text-2xl text-green-500" />
              <p>No judgement</p>
            </div>
            <div className="flex items-center gap-1">
              <IoCheckmarkSharp className="text-2xl text-green-500" />
              <p>No sharing data to thrd party's</p>
            </div>
          </div>
          <button className=" rounded-xl duration-200 hover:bg-green-400 bg-green-500 py-2 shadow-green-500/70 text-xl font-semibold text-white shadow-lg">
            Subscribe
          </button>
        </div>
      </div>
    </div>
  );
};

export default Subscriptions;
