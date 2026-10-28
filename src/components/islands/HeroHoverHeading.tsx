import { useState, type MouseEvent } from "react";

export interface HeadingSegment {
  text: string;
  image?: string;
  imageAlt?: string;
}

interface Props {
  segments: HeadingSegment[];
}

export default function HeroHoverHeading({ segments }: Props) {
  const [activeImage, setActiveImage] = useState<{
    src: string;
    alt: string;
  } | null>(null);
  const [coords, setCoords] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const handleMouseMove = (e: MouseEvent<HTMLSpanElement>) => {
    setCoords({ x: e.clientX, y: e.clientY });
  };

  return (
    <>
      {segments.map((seg, idx) =>
        seg.image ? (
          <span
            key={idx}
            className="serif-italic hover-word"
            onMouseEnter={(e) => {
              setCoords({ x: e.clientX, y: e.clientY });
              setActiveImage({
                src: seg.image!,
                alt: seg.imageAlt ?? seg.text,
              });
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setActiveImage(null)}
          >
            {seg.text}
          </span>
        ) : (
          <span key={idx}>{seg.text}</span>
        )
      )}
      <div
        className={`floating-preview${activeImage ? " active" : ""}`}
        style={{ left: `${coords.x}px`, top: `${coords.y}px` }}
      >
        {activeImage && <img src={activeImage.src} alt={activeImage.alt} />}
      </div>
    </>
  );
}
