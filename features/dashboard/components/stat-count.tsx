// features/dashboard/components/stat-count.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { animate } from "motion/react";

export function StatCount({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<number>(0);

  useEffect(() => {
    const controls = animate(ref.current, value, {
      duration: 0.6,
      ease: "easeOut",
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    });
    ref.current = value;
    return () => controls.stop();
  }, [value]);

  return <span>{display.toLocaleString()}</span>;
}
