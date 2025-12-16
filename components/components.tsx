import Image from "next/image";

import { useSelected } from "../context/selectedContext";

export function ImageWrapper({ url }: { url: string }) {
  return (
    <div className="flex items-center p-4 ">
      <Image
        className="rounded-md border-1"
        width={512}
        height={512}
        src={
          // "https://storage.imagerouter.io/b35083d9-b150-42e2-abb9-fad4d35c8f06.jpg"
          url
        }
        alt={"Image not loading, please reload the page."}
      ></Image>
    </div>
  );
}

export function QuestionArea({ gen_prompts }: { gen_prompts: string[] }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-4">
      {gen_prompts.map((item, index) => {
        return <Question key={index} text={item} index={index} />;
      })}
    </div>
  );
}

function Question({ text, index }: { text: string; index: number }) {
  const { state, dispatch } = useSelected();

  return (
    <button
      disabled={state.isAnswered}
      onClick={() => dispatch({ type: "setSelectedItem", payload: index })}
      className={`p-4 rounded-sm max-w-lg text-[#0B0B0]
      ${
        state.isAnswered
          ? state.correctPrompt == index
            ? "bg-[#8FFF83]"
            : "bg-[#FF7D7D]"
          : state.selectedItem != index
          ? "bg-gradient-to-r from-[#F6EEE3] to-[#E5CBBA] hover:shadow-md shadow-[#FF8400]"
          : "bg-[#F4CA90] "
      }
      ${
        state.selectedItem != index
          ? "border-2"
          : "border-2 border-[#FF8400] shadow-lg shadow-[#FF8400]"
      } `}
    >
      {text}
    </button>
  );
}
