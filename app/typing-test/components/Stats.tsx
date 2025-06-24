"use client";
import { useTypingTestContext } from "../context/TypingTestContext";
import CircularProgress from "./CircularProgress";

const Stats = () => {
  const { timer, wpm, cpm, accuracy } = useTypingTestContext();
  return (
    <div className="p-8 flex justify-center gap-4">
      <CircularProgress value={timer} size={120} strokeWidth={5}>
        <h1 className="text-4xl font-bold text-center text-foreground">{timer}</h1>
        <h6 className="text-sm text-center font-light text-muted-foreground">seconds</h6>
      </CircularProgress>
      <div className="w-24 flex flex-col justify-center bg-background rounded-full">
        <h1 className="text-4xl font-bold text-center text-foreground">{wpm}</h1>
        <h6 className="text-sm text-center font-light text-muted-foreground">words/min</h6>
      </div>
      <div className="w-24 flex flex-col justify-center bg-background rounded-full">
        <h1 className="text-4xl font-bold text-center text-foreground">{cpm}</h1>
        <h6 className="text-sm text-center font-light text-muted-foreground">chars/min</h6>
      </div>
      <div className="w-24 flex flex-col justify-center bg-background rounded-full">
        <h1 className="text-4xl font-bold text-center text-foreground">{accuracy}</h1>
        <h6 className="text-sm text-center font-light text-muted-foreground">% accuracy</h6>
      </div>
    </div>
  );
};

export default Stats;
