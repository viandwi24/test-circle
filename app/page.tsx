'use client'

import { useCircleSdk } from "./libs/circle";
import { useEffect } from "react";

export default function Home() {
  const circle = useCircleSdk()

  useEffect(() => {
    console.log("sdk", circle.sdk)
  }, [circle])

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <button onClick={circle.login}>
        login
      </button>
    </div>
  );
}
