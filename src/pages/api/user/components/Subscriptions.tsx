import { useState } from "react";
import { IoCheckmarkSharp } from "react-icons/io5";
enum SubscriptionsProps {
  day,
  week,
  month,
}
//drek
const Subscriptions = () => {
  const [selectedSubscription, setSelectedSubscription] =
    useState<SubscriptionsProps>(SubscriptionsProps.month);
  return (
    <div className="flex h-full items-center justify-center bg-gradient-to-t from-sky-500 to-sky-100">
      <div className="flex rounded-2xl bg-gray-100 p-10 text-black shadow-xl">
        <div className="flex flex-col gap-2">
          <div className="h-full rounded-3xl bg-white p-6 text-black ">
            <div className="flex justify-center rounded-3xl pt-3 pb-10 text-xl text-black ">
              <button
                onClick={() => setSelectedSubscription(SubscriptionsProps.day)}
                className="duration-700 rounded-l-2xl border-r border- bg-sky-500 px-10 py-2 font-medium text-white hover:bg-sky-600"
              >
                DAY
              </button>
              <button
                onClick={() => setSelectedSubscription(SubscriptionsProps.week)}
                className="duration-700 bg-sky-500 px-10 py-2 font-medium text-white hover:bg-sky-600"
              >
                WEEK
              </button>
              <button
                onClick={() =>
                  setSelectedSubscription(SubscriptionsProps.month)
                }
                className="duration-700 rounded-r-2xl border-l border-white bg-sky-500 px-10 py-2 font-medium text-white hover:bg-sky-600"
              >
                MONTH
              </button>
            </div>
            <h2 className="border-b border-gray-400 pb-6 text-center text-6xl tracking-tighter">
              {selectedSubscription === SubscriptionsProps.month
                ? "45"
                : selectedSubscription === SubscriptionsProps.day
                ? "2"
                : "12"}
              <sup className="p-1 text-4xl">€</sup>
            </h2>
            <div className="flex items-center gap-3 p-1 pb-3 pt-6">
              <IoCheckmarkSharp className="text-xl text-sky-500" />
              <p className="text-[15px]">Lorem ipsum dolor sit amet</p>
            </div>
            <div className="flex items-center gap-3 p-1 pb-3">
              <IoCheckmarkSharp className="text-xl text-sky-500" />
              <p className="text-[15px]">Consectetur adipiscing elit</p>
            </div>
            <div className="flex items-center gap-3 p-1 pb-3">
              <IoCheckmarkSharp className="text-xl text-sky-500" />
              <p className="text-[15px]">Sed do eiusmod tempor incididunt</p>
            </div>
            <div className="flex items-center gap-3 p-1 pb-3">
              <IoCheckmarkSharp className="text-xl text-sky-500" />
              <p className="text-[15px]">Labore et dolore magna aliqua</p>
            </div>
            <div className="flex items-center gap-3 p-1 pb-3">
              <IoCheckmarkSharp className="text-xl text-sky-500" />
              <p className="text-[15px]">Ut enim ad minim veniam</p>
            </div>
            <div className="flex items-center gap-3 p-1 pb-3">
              <IoCheckmarkSharp className="text-xl text-sky-500" />
              <p className="text-[15px]">
                Nostrud exercitation ullamco laboris
              </p>
            </div>
            <div className="flex items-center gap-3 p-1 pb-3">
              <IoCheckmarkSharp className="text-xl text-sky-500" />
              <p className="text-[15px]">Duis aute irure dolor in</p>
            </div>
            <div className="flex items-center gap-3 p-1 pb-3">
              <IoCheckmarkSharp className="text-xl text-sky-500" />
              <p className="text-[15px]">Excepteur sint occaecat cupidatat</p>
            </div>
          </div>
          <button className="mt-1 rounded-2xl bg-sky-500 py-2 text-2xl font-bold text-white duration-700 hover:bg-sky-600">
            SUBSCRIBE
          </button>
        </div>
      </div>
    </div>
  );
};

export default Subscriptions;
