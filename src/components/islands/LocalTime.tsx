import { useEffect, useState } from "react";

interface Props {
  cityPrefix: string;
  fallbackTime: string;
  timeZone: string;
  locale: string;
}

export default function LocalTime({
  cityPrefix,
  fallbackTime,
  timeZone,
  locale,
}: Props) {
  const [time, setTime] = useState<string>(fallbackTime);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = new Intl.DateTimeFormat(locale, {
        timeZone,
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(now);
      setTime(formatted);
    };

    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, [locale, timeZone]);

  return (
    <span>
      {cityPrefix} {time}
    </span>
  );
}
