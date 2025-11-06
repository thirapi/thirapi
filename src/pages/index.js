import { Geist, Geist_Mono } from "next/font/google";
import NowPlaying from "@/components/NowPlaying";
import ViewSwitcher from "@/components/ViewSwitcher";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  return (
    <div
      className="bg-gradient-to-br from-gray-900 to-gray-800 text-white min-h-screen flex items-center justify-center"
    >
      <ViewSwitcher />
      <NowPlaying />
    </div>
  );
}
