import { createContext, useContext } from "react";

export const SelectedContext = createContext({
  selectedItem: 0,
  setSelectedItem: (value: number) => {},
  isAnswered: false,
  correctPrompt: 0
});

export function useSelected() {
  return useContext(SelectedContext);
}
