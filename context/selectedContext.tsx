import { createContext, useContext, useReducer} from "react";

type State = {
  isLoading: boolean;
  loadingStatus: string;
  prompts: string[];
  correctPrompt: number;
  selectedItem: number;
  isAnswered: boolean;
  isCorrect: boolean;
  score: number;
  attempts: number;
  refreshToken: number;
  imageUrl: string;
};

type Action = { type: string; payload?: any } | { type: "updateRefreshToken" };

function reducer(state: State, action: Action) {
  switch (action.type) {
    case "setLoading":
      return { ...state, isLoading: action.payload };
    case "setLoadingStatus":
      return { ...state, loadingStatus: action.payload };
    case "setPrompts":
      return { ...state, prompts: action.payload };
    case "setCorrectPrompt":
      return { ...state, correctPrompt: action.payload };
    case "setSelectedItem":
      return { ...state, selectedItem: action.payload };
    case "setIsAnswered":
      return { ...state, isAnswered: action.payload };
    case "setIsCorrect":
      return { ...state, isCorrect: action.payload };
    case "setScore":
      return { ...state, score: action.payload };
    case "setAttempts":
      return { ...state, attempts: action.payload };
    case "setImageUrl":
      return { ...state, imageUrl: action.payload };
    case "updateRefreshToken":
      return { ...state, refreshToken: state.refreshToken + 1 };
    default:
      return state;
  }
}

const initialStaete: State = {
  isLoading: true,
  loadingStatus: "Loading",
  prompts: [""],
  correctPrompt: -1,
  selectedItem: -1,
  isAnswered: false,
  isCorrect: false,
  score: 0,
  attempts: 0,
  refreshToken: 0,
  imageUrl: "",
};

type SelectedContextType = {
  state: State;
  dispatch: React.Dispatch<Action>;
};

export const SelectedContext = createContext<SelectedContextType | null>(null);

export function SelectedProvider({children}: {children: React.ReactNode}) {
  const [state, dispatch] = useReducer(reducer, initialStaete);

  return (
    <SelectedContext.Provider value={{ state, dispatch }}>
      {children}
    </SelectedContext.Provider>
  );
}

export function useSelected() {
  const ctx = useContext(SelectedContext);
  if (!ctx) {
    throw new Error("useSelected must be used within a SelectedProvider");
  }
  return ctx;
}
