import RegisterFrom from "src/components/forms/register/registerForm";
import UserNavigation from "src/components/navigation/userNavigation";
import { Poppins } from "next/font/google";


const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-Poppins",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export default function Register() {
  return (
    <>
      <main
        className={
          poppins.className +
          " justify-cente flex min-h-screen flex-col items-center bg-white"
        }
      >
        <UserNavigation/>
        <RegisterFrom/>
      </main>
    </>
  );
}