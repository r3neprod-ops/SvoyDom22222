import Image from 'next/image';
import { extractUrlFromBackground } from '@/lib/image';

export default function SlotBox({ className = '', backgroundImage = null, children = null }) {
  const imageUrl = extractUrlFromBackground(backgroundImage);
  const slotClass = backgroundImage ? `slot-box-with-image ${className}` : `slot-box ${className}`;

  return (
    <div className={`${slotClass} relative overflow-hidden`} aria-hidden="true">
      {imageUrl && (
        <Image
          src={imageUrl}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          loading="lazy"
          className="object-cover object-center"
        />
      )}
      {children}
    </div>
  );
}
