"use client";

import { ImageWrapper, QuestionArea } from "../components/components";

import { useSelected } from "../context/selectedContext";
import { new_round } from "@/scripts/load_new_round";

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
import { useEffect } from "react";
import { setCookie } from "@/scripts/cookie_sender";

export default function Home() {
  const { state, dispatch } = useSelected();
  const {
    isLoading,
    loadingStatus,
    prompts,
    correctPrompt,
    selectedItem,
    isAnswered,
    isCorrect,
    score,
    attempts,
    refreshToken,
    imageUrl,
  } = state;

  // Called on submit
  function submitted() {
    const isRight = correctPrompt == selectedItem;
    dispatch({ type: "setIsCorrect", payload: isRight });
    dispatch({ type: "setIsAnswered", payload: true });
    if (isRight) dispatch({ type: "setScore", payload: score + 1 });
    dispatch({ type: "setAttempts", payload: attempts + 1 });
  }

  // New Question
  function reset() {
    dispatch({ type: "updateRefreshToken" });
    dispatch({ type: "setIsCorrect", payload: false });
    dispatch({ type: "setIsAnswered", payload: false });
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await new_round((value: string) =>
        dispatch({ type: "setLoadingStatus", payload: value })
      );
      if (cancelled) return;

      const { gen_prompts, correct_prompt, url, id } = res ?? {
        gen_prompts: [],
        correct_prompt: -1,
        url: "",
        id: -1,
      };

      setCookie(id);
      console.log("new_round url:", res?.url);
      dispatch({ type: "setImageUrl", payload: url });
      dispatch({ type: "setPrompts", payload: gen_prompts });
      dispatch({ type: "setCorrectPrompt", payload: correct_prompt });
    })();

    return () => {
      cancelled = true;
    };
  }, [refreshToken, dispatch]);

  // Loading screen
  if (isLoading) {
    return (
      <div className="flex items-center justify-center text-[#F6EEE3] h-dvh">
        {loadingStatus}...
      </div>
    );
  }

  // State on Initial Load
  console.log("imageUrl:", imageUrl, typeof imageUrl);
  if (imageUrl == "") {
    return (
      <div className="flex items-center justify-center text-[#F6EEE3] h-dvh">
        <button
          onClick={reset}
          className="hover:shadow-md shadow-[#FF8400] color-[#E7D0C0] rounded-[20px] pr-3 pl-3 pt-1 pb-1 border-2 text-[#F6EDE2]"
        >
          Start the game
        </button>
      </div>
    );
  }

  // Main Game Page
  return (
    <div className="font-mono flex flex-col items-center">
      <h1 className="text-[#F6EEE3] text-2xl p-5">
        {" "}
        Which Prompt Generated This Image?{" "}
      </h1>
      <Dialog>
        <div className="flex items-center flex-col lg:flex-row">
          <ImageWrapper url={imageUrl} />
          <QuestionArea gen_prompts={prompts} />
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
              {isCorrect ? (
                <span className="text-[#8FFF83]">You got it correct!</span>
              ) : (
                <span className="text-[#FF7D7D]">Sorry, you were wrong.</span>
              )}
            </DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <DialogClose className="text-[#F6EEE3] border-2 hover:shadow-md shadow-[#FF8400]">
              See Answer
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
