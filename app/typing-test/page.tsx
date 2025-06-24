"use client";
import { TypingTestProvider } from "./context/TypingTestContext";
import Stats from "./components/Stats";
import TypingArea from "./components/TypingArea";

export default function TypingTestPage() {
  return (
    <TypingTestProvider>
      <div className="flex justify-center min-h-screen items-center bg-background">
        <div className="w-full max-w-3xl px-4">
          <div className="flex flex-col gap-4">
            <h6 className="text-center font-light text-muted-foreground tracking-widest">
              TYPING SPEED TEST
            </h6>
            <h1 className="text-4xl md:text-6xl font-bold text-center text-foreground">
              Test your typing skills
            </h1>
            <Stats />
            <TypingArea />
          </div>
        </div>
      </div>
    </TypingTestProvider>
  );
}
