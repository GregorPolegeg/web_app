import UserNavigation from "src/components/navigation/userNavigation";
import { Poppins } from "next/font/google";
import HomePage from "./home";
import { useSession } from "next-auth/react";
import LogedPage from "./logedhome"
const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-Poppins",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export default function Home() {
  const { data: session } = useSession();
  return (
    <>
      <UserNavigation/>
      <div className="w-full flex justify-center mt-10">
        {session? <LogedPage/> : <HomePage/> }
      </div>
    </>
  );
}
