"use client";

import React from "react";

export const useCountdown = () => {
  const [time, setTime] = React.useState(0);
  const timeRef = React.useRef(0);
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    timerRef.current = null;
  };

  const startTimer = (seconds: number, onComplete?: (() => void) | undefined) => {
    if (timerRef.current) {
      stopTimer();
    }
    setTime(seconds);
    timeRef.current = seconds;
    timerRef.current = setInterval(() => {
      if (timeRef.current > 0) {
        setTime((prev) => prev - 1);
        timeRef.current = timeRef.current - 1;
      } else {
        stopTimer();
        if (onComplete) {
          onComplete();
        }
      }
    }, 1000);
  };

  React.useEffect(() => {
    return () => stopTimer();
  }, []);

  return { time, startTimer, stopTimer };
};
