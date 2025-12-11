"use client";

import { ImageWrapper, QuestionArea } from "../components/components";

import {
  fetch_im_rout_images,
  fetch_runware_images,
} from "../scripts/fetch_images";
import { gen_three } from "../scripts/generate_ai_prompts";

import { useSelected } from "../context/selectedContext";

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

  function submitted() {
    const isRight = correctPrompt == selectedItem;
    dispatch({ type: "setIsCorrect", payload: isRight });
    dispatch({ type: "setIsAnswered", payload: true });
    if (isRight) dispatch({ type: "setScore", payload: score + 1 });
    dispatch({ type: "setAttempts", payload: attempts + 1 });
  }

  function reset() {
    dispatch({ type: "updateRefreshToken" });
  }

  async function load() {
    // ! should create a new script which aggregates this and grabs from db

    dispatch({ type: "setLoadingStatus", payload: "Generating Prompts" });
    let gen_prompts: string[] = [];
    try {
      gen_prompts = await gen_three();
    } catch (e: unknown) {
      dispatch({
        type: "setLoadingStatus",
        payload: "Unexpected error with Prompt Generation",
      });
      if (e instanceof Error) {
        dispatch({
          type: "setLoadingStatus",
          payload: "Error Generating Prompts: " + e.message,
        });
      }
      return;
    }
    dispatch({ type: "setPrompts", payload: gen_prompts });
    const random_index: number = Math.floor(Math.random() * 3);
    dispatch({ type: "setLoadingStatus", payload: "Generating Images" });
    dispatch({ type: "setCorrectPrompt", payload: random_index });
    const prompt = prompts[random_index];
    let img_url = "";

    try {
      img_url = (await fetch_runware_images(prompt)) ?? "";
    } catch (e) {
      dispatch({
        type: "setLoadingStatus",
        payload: "Unexpected error with Prompt Generation",
      });
      if (e instanceof Error) {
        dispatch({
          type: "setLoadingStatus",
          payload: "Error Generating Images: " + e.message,
        });
      }
      return;
    }

    dispatch({ type: "setLoadingStatus", payload: "Loading" });
    dispatch({ type: "setImageUrl", payload: img_url });
    dispatch({ type: "setIsLoading", payload: false });
  }

  // ! change this so the user has to press a button to generate

  // useEffect(() => {
  //   load();
  // }, []);

  // useEffect(() => {
  //   setSelectedItem(-1);
  //   setIsCorrect(false);
  //   setIsAnswered(false);
  //   load();
  // }, [refreshToken]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center text-[#F6EEE3]">
        {loadingStatus}...
      </div>
    );
  }

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
