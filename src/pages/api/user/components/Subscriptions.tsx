import { FaCheck } from "react-icons/fa";
import { IoIosCheckbox } from "react-icons/io";
import { GiCheckMark } from "react-icons/gi";
import { useState } from "react";
import { subscribe } from "diagnostics_channel";
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
    <div className="flex h-full items-center justify-center bg-gradient-to-t from-sky-300 to-sky-100">
      <div className="flex rounded-2xl bg-stone-200 p-3 text-black opacity-70 shadow-xl">
        <div className="flex flex-col gap-2">
          <div className="flex justify-center rounded-3xl pb-1 text-xl text-black">
            <button
              onClick={() => setSelectedSubscription(SubscriptionsProps.day)}
              className="duration-400 rounded-l-2xl border-r border-white bg-sky-500 px-10 py-2 font-medium text-white hover:bg-sky-600"
            >
              DAY
            </button>
            <button
              onClick={() => setSelectedSubscription(SubscriptionsProps.week)}
              className="duration-400 bg-sky-500 px-10 py-2 font-medium text-white hover:bg-sky-600"
            >
              WEEK
            </button>
            <button
              onClick={() => setSelectedSubscription(SubscriptionsProps.month)}
              className="duration-400 rounded-r-2xl border-l border-white bg-sky-500 px-10 py-2 font-medium text-white hover:bg-sky-600"
            >
              MONTH
            </button>
          </div>
          <div className="h-full rounded-3xl bg-white p-6 text-black ">
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
          <button className="mt-1 rounded-2xl bg-sky-500 px-10 py-2 text-2xl font-medium text-white duration-300 hover:bg-sky-600">
            SUBSCRIBE
          </button>
        </div>
      </div>
    </div>
  );
};

export default Subscriptions;