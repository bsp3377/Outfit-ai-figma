import image_0ef793a5965fe79a80bdb0d1fd88d97304605580 from 'figma:asset/0ef793a5965fe79a80bdb0d1fd88d97304605580.png';
import { useState } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import beforeProductImage from 'figma:asset/4f9f1969f170ddabc477ebee98218b96c296010d.png';
import afterProductImage from 'figma:asset/169288cf84b5497e363924fb9978b10a4b6352dd.png';
import newAfterProductImage from 'figma:asset/b9cb16a4d4cac524e72286f4fd9a7a08e0a64d1b.png';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeAlt?: string;
  afterAlt?: string;
}

export function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeAlt = "Before",
  afterAlt = "After"
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const handleMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging && e.type !== 'click') return;

    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const position = ((x - rect.left) / rect.width) * 100;
    setSliderPosition(Math.min(Math.max(position, 0), 100));
  };

  return (
    <div
      className="relative w-full h-full overflow-hidden rounded-lg cursor-col-resize select-none"
      onMouseMove={handleMove}
      onMouseDown={(e) => {
        setIsDragging(true);
        handleMove(e);
      }}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
      onTouchMove={handleMove}
      onTouchStart={(e) => {
        setIsDragging(true);
        handleMove(e);
      }}
      onTouchEnd={() => setIsDragging(false)}
      onClick={handleMove}
    >
      {/* After Image (right side) */}
      <div className="absolute inset-0">
        <img
          src={afterImage}
          alt={afterAlt}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Before Image (left side) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img
          src={beforeImage}
          alt={beforeAlt}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Slider Line */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white shadow-lg"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-gray-700">
            <path d="M6 4L2 8L6 12M10 4L14 8L10 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-4 left-4 bg-black/60 text-white px-2 py-1 rounded text-xs">
        Before
      </div>
      <div className="absolute top-4 right-4 bg-black/60 text-white px-2 py-1 rounded text-xs">
        After
      </div>
    </div>
  );
}