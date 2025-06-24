"use client";
import React, { useState, useEffect, useRef } from "react";
import { generateRandomParagraph } from "../utils/paragraph";
import { unsupportedKeys } from "../utils/unsupportedKeys";
import { useTypingTestContext } from "../context/TypingTestContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const TypingArea = () => {
  const { setWpm, setCpm, setAccuracy, setTimer, timer, wpm, cpm, accuracy } =
    useTypingTestContext();
  const [startedTyping, setStartedTyping] = useState(false);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const [paragraph, setParagraph] = useState("");
  const [state, setState] = useState<{
    letterIndex: number;
    wordsMap: Map<number, { typedLetter: string; supposedToBe: string }>;
  }>({ letterIndex: 0, wordsMap: new Map() });
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    const { paragraph } = generateRandomParagraph();
    setParagraph(paragraph);
  }, []);

  useEffect(() => {
    if (timer <= 0) {
      setOpenDialog(true);
      setStartedTyping(false);
    } else {
      window.addEventListener("keydown", handleKeyPress);
      cursorRef.current?.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
      return () => {
        window.removeEventListener("keydown", handleKeyPress);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, timer]);

  useEffect(() => {
    if (startedTyping) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [startedTyping, setTimer]);

  const handleKeyPress = (e: KeyboardEvent) => {
    if (unsupportedKeys.includes(e.key)) return;
    const letters = paragraph.split("");
    if (!startedTyping) setStartedTyping(true);

    // Calculate stats
    let typedLetters = Array.from(state.wordsMap.values()).map((l) => l.typedLetter);
    let typedWords = typedLetters
      .join("")
      .split(" ")
      .filter((w) => w !== "");
    let supposedToBeLetter = Array.from(state.wordsMap.values()).map((l) => l.supposedToBe);
    let supposedToBeWords = supposedToBeLetter
      .join("")
      .split(" ")
      .filter((w) => w !== "");
    let correctWords = supposedToBeWords.filter((w, i) => w === typedWords[i]);
    let accuracy =
      supposedToBeWords.length > 0
        ? Math.floor((correctWords.length / supposedToBeWords.length) * 100)
        : 0;
    if (e.key === " ") {
      setWpm(Math.floor(correctWords.length));
      setCpm(Math.floor(correctWords.join("").length));
      setAccuracy(accuracy);
    }
    if (e.key !== "Backspace") {
      setState((prev) => ({
        ...prev,
        letterIndex: prev.letterIndex + 1,
        wordsMap: prev.wordsMap.set(prev.letterIndex, {
          typedLetter: e.key,
          supposedToBe: letters[prev.letterIndex],
        }),
      }));
    } else if (e.key === "Backspace" && state.letterIndex > 0) {
      setState((prev) => ({
        ...prev,
        letterIndex: prev.letterIndex - 1,
        wordsMap: prev.wordsMap.set(prev.letterIndex, {
          typedLetter: "",
          supposedToBe: letters[prev.letterIndex],
        }),
      }));
    }
  };

  return (
    <>
      <div className="shadow-lg rounded-lg h-36 overflow-x-auto scrollbar-hidden flex items-center justify-center">
        <div className="inline-flex items-center justify-center">
          {paragraph.split("").map((letter, letterIndex) => (
            <span key={letter + letterIndex}>
              <span
                className={`text-3xl p-0 m-0 font-thin ${
                  letterIndex === state.letterIndex
                    ? "text-primary"
                    : letterIndex > state.letterIndex
                      ? "text-foreground"
                      : letterIndex < state.letterIndex &&
                          state.wordsMap.get(letterIndex)?.typedLetter ===
                            state.wordsMap.get(letterIndex)?.supposedToBe
                        ? "text-muted-foreground"
                        : "text-red-500"
                }`}
              >
                {letterIndex === state.letterIndex && (
                  <span
                    ref={cursorRef}
                    className="m-0 animate-cursor border-r-2 border-foreground"
                  />
                )}
                {letter === " " ? "\u00A0" : letter}
              </span>
            </span>
          ))}
        </div>
      </div>
      <Dialog
        open={openDialog}
        onOpenChange={() => {
          setState({ letterIndex: 0, wordsMap: new Map() });
          setOpenDialog(false);
          setTimer(60);
          setWpm(0);
          setCpm(0);
          setAccuracy(0);
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Your time is up.</DialogTitle>
            <DialogDescription>
              Well...Your typing speed is <b className="text-foreground">{wpm} words per minute</b>{" "}
              and <b className="text-foreground">{cpm} characters per minute</b> with an accuracy of{" "}
              <b className="text-foreground">{accuracy}%</b>. Keep practicing!
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TypingArea;
