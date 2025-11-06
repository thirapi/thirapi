import NowPlayingDVD from '@/components/NowPlayingDVD';
import ViewSwitcher from '@/components/ViewSwitcher';

export default function NowPlayingDVDPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
      <ViewSwitcher />
        <NowPlayingDVD />
    </div>
  );
}
