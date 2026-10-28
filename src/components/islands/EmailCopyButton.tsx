import { useState } from "react";

interface Props {
  email: string;
  displayEmail: string;
  defaultBadge: string;
  copiedBadge: string;
}

export default function EmailCopyButton({
  email,
  displayEmail,
  defaultBadge,
  copiedBadge,
}: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(email).then(() => {
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 3000);
    });
  };

  return (
    <button
      type="button"
      className={`email-copy-btn${copied ? " copied" : ""}`}
      onClick={handleCopy}
    >
      <span>{displayEmail}</span>
      <span className="copy-badge">{copied ? copiedBadge : defaultBadge}</span>
    </button>
  );
}
