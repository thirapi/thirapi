import Link from 'next/link';
import { useRouter } from 'next/router';

export default function ViewSwitcher() {
  const router = useRouter();

  const baseClasses = "px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer block";
  const activeClasses = "bg-gray-700 text-white";
  const inactiveClasses = "text-gray-400 hover:bg-gray-800 hover:text-white";

  return (
    <div className="fixed top-5 right-5 z-50">
      <div className="flex items-center space-x-1 bg-gray-900 bg-opacity-75 backdrop-blur-sm border border-gray-700 rounded-lg p-1">
        <Link 
          href="/"
          className={`${baseClasses} ${router.pathname === '/' ? activeClasses : inactiveClasses}`}>
            Card
        </Link>
        <Link 
          href="/now-playing-dvd"
          className={`${baseClasses} ${router.pathname === '/now-playing-dvd' ? activeClasses : inactiveClasses}`}>
            Disc
        </Link>
      </div>
    </div>
  );
}
