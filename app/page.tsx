"use client";

import { ImageWrapper, QuestionArea } from "../components/components";

import { fetch_ai_images } from "../scripts/fetch_images";
import { gen_three } from "../scripts/generate_ai_prompts";

import { SelectedContext } from "../context/selectedContext";
import { useEffect, useState, useTransition } from "react";

import {
  Dialog,
  DialogClose,
  DialogTrigger,
  DialogHeader,
  DialogFooter,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Span } from "next/dist/trace";

export default function Home() {
  // * rewrite with reducer later

  const [isLoading, setIsLoading] = useState(true);
  const [refreshToken, setRefreshToken] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState("Loading");

  const [prompts, setPrompts] = useState([""]);
  const [correctPrompt, setCorrectPrompt] = useState(-1);
  const [selectedItem, setSelectedItem] = useState(-1);
  const [isAnswered, setIsAnswered] = useState(false);

  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);

  const [imageUrl, setImageUrl] = useState("");

  function submitted() {
		const isRight = correctPrompt == selectedItem
    setIsCorrect(isRight);
    setIsAnswered(true);
    if (isRight) setScore(score + 1);
    setAttempts(attempts + 1);
  }

  function reset() {
    setRefreshToken(refreshToken + 1);
  }

  async function load() {
    setLoadingStatus("Generating Prompts");
    const gen_prompts: string[] = await gen_three();
    setPrompts(gen_prompts);
    const random_index: number = Math.floor(Math.random() * 3);
    setLoadingStatus("Generating Images");
    setCorrectPrompt(random_index);
    const prompt = prompts[random_index];
    const img_url = await fetch_ai_images(prompt);
    setLoadingStatus("Loading");
    setImageUrl(img_url);
    setIsLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    setSelectedItem(-1);
    setIsCorrect(false);
    setIsAnswered(false);
    load();
  }, [refreshToken]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center text-[#F6EEE3]">{loadingStatus}...</div>
    );
  }

  return (


    <div className="font-mono flex flex-col items-center">
			<h1 className="text-[#F6EEE3] text-2xl p-5"> Which Prompt Generated This Image? </h1>
      <Dialog>
        <div className="flex items-center flex-col lg:flex-row">
          <ImageWrapper url={imageUrl} />
          <SelectedContext.Provider
            value={{ selectedItem, setSelectedItem, isAnswered, correctPrompt }}
          >
            <QuestionArea gen_prompts={prompts} />
          </SelectedContext.Provider>
        </div>

        <div className="flex items-center flex-col">
          <div className="flex gap-4 items-center justify-center p-4">
            <button
              onClick={reset}
              className="hover:shadow-md shadow-[#FF8400] color-[#E7D0C0] rounded-[20px] pr-3 pl-3 pt-1 pb-1 border-2 text-[#F6EDE2]"
            >
              New Image
            </button>
            <DialogTrigger asChild>
              <button
                className={` rounded-[20px] pr-3 pl-3 pt-1 pb-1  ${
                  isAnswered || selectedItem == -1
                    ? "bg-[#2B2B2B] text-[#191919] "
                    : "hover:shadow-sm shadow-[#FF8400] bg-[#D9BDA5]"
                }`}
                disabled={isAnswered || selectedItem == -1}
                onClick={submitted}
              >
                Submit
              </button>
            </DialogTrigger>
          </div>
          <div className="text-[#F6EEE3]">
            <span className="text-[#8FFF83]">{score} Correct</span> :{" "}
            <span className="text-[#FF7D7D]">{attempts - score} Incorrect</span>
          </div>
        </div>

        <DialogContent className="bg-[#202020] font-mono">
          <DialogHeader>
            <DialogTitle>
              {isCorrect 
							? <span className="text-[#8FFF83]">
								You got it correct!
								</span>
							: <span className="text-[#FF7D7D]">
								Sorry, you were wrong.
								</span>}
            </DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <DialogClose className="text-[#F6EEE3] border-2 hover:shadow-md shadow-[#FF8400]">See Answer</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
