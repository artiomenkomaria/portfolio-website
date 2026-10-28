import { useState, type MouseEvent } from "react";

export interface ShowreelProps {
  bgImage: string;
  tagLeft: string;
  tagRight: string;
  title: string;
  subtitle: string;
  cursorBadge: string;
  modalTitle: string;
  modalDescription: string;
  closeLabel: string;
}

export default function ShowreelWidget({
  bgImage,
  tagLeft,
  tagRight,
  title,
  subtitle,
  cursorBadge,
  modalTitle,
  modalDescription,
  closeLabel,
}: ShowreelProps) {
  const [cursorVisible, setCursorVisible] = useState(false);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [modalOpen, setModalOpen] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    setCursorPos({ x: e.clientX, y: e.clientY });
  };

  return (
    <>
      <div
        className="bento-card hero-right"
        onMouseEnter={(e) => {
          setCursorPos({ x: e.clientX, y: e.clientY });
          setCursorVisible(true);
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setCursorVisible(false)}
        onClick={() => setModalOpen(true)}
      >
        <div
          className="showreel-bg"
          style={
            {
              "--showreel-bg-image": `url('${bgImage}')`,
            } as React.CSSProperties
          }
        />
        <div className="showreel-top">
          <span className="reel-tag">{tagLeft}</span>
          <span className="reel-tag">{tagRight}</span>
        </div>
        <div className="showreel-bottom">
          <div>
            <div className="showreel-title">{title}</div>
            <div className="showreel-subtitle">{subtitle}</div>
          </div>
        </div>
      </div>

      <div
        className={`cursor-badge${cursorVisible ? " visible" : ""}`}
        style={{ left: `${cursorPos.x}px`, top: `${cursorPos.y}px` }}
      >
        {cursorBadge}
      </div>

      <div
        className={`modal-overlay${modalOpen ? " open" : ""}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) setModalOpen(false);
        }}
      >
        <div className="modal-box">
          <button
            type="button"
            className="modal-close"
            onClick={() => setModalOpen(false)}
          >
            {closeLabel}
          </button>
          <div className="modal-content">
            <p className="serif-italic modal-heading">{modalTitle}</p>
            <p className="modal-desc">{modalDescription}</p>
          </div>
        </div>
      </div>
    </>
  );
}
