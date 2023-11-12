import UserNavigation from "src/components/navigation/userNavigation";
import { Poppins } from "next/font/google";
import HomePage from "./home";
import { useSession } from "next-auth/react";
import LogedPage from "./logedhome"
import { Metadata } from "next";
const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-Poppins",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata : Metadata = {
  title: 'Call Danny',
  description: 'Need help you can always count on Danny',
  manifest: '/manifest.json',
  icons: {apple: '/icon512_rounded.png'},
  themeColor:'#fff'
}

export default function Home() {
  const { data: session } = useSession();
  return (
    <div className="h-screen">
      <UserNavigation/>
        {session? <LogedPage/> : <HomePage/> }
    </div>
  );
}
