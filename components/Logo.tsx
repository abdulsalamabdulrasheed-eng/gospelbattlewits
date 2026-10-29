import Image from 'next/image';
import Link from 'next/link';

export function Logo({ size = 40, showText = true }: { size?: number; showText?: boolean }) {
  // REPLACE THIS URL WITH YOUR ACTUAL LOGO URL (e.g., from Supabase Storage or /public)
  const logoUrl = "https://shrmqynkkziwvcqwpuvl.supabase.co/storage/v1/object/public/assets/logo.png"; 
  // If you don't have the image yet, it will fallback to a styled div below.
  
  return (
    <Link href="/" className="flex items-center gap-2 shrink-0">
      <div 
        style={{ width: size, height: size }} 
        className="relative rounded-lg overflow-hidden bg-white flex items-center justify-center border border-gray-200 shadow-sm"
      >
        {/* Fallback if image fails to load */}
        <img 
          src={logoUrl} 
          alt="TFTC Logo" 
          className="w-full h-full object-contain p-1"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
            (e.target as HTMLImageElement).parentElement!.innerHTML = '<span class="font-black text-black" style="font-size:' + (size * 0.4) + 'px">GB</span>';
          }}
        />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className="font-black text-sm tracking-wider uppercase leading-none">TFTC</span>
          <span className="text-[9px] text-gray-500 tracking-widest uppercase">Live Show</span>
        </div>
      )}
    </Link>
  );
}
