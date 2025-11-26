import { create } from "zustand";

interface ImageGeneration {
  id: string;
  imageUrl?: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  prompt: string;
  ratio: string;
  createdAt: Date;
}

interface ImageStudioState {
  prompt: string;
  ratio: string;
  style: string;
  model: string;
  isGenerating: boolean;
  generations: ImageGeneration[];
  credits: number;

  setPrompt: (prompt: string) => void;
  setRatio: (ratio: string) => void;
  setStyle: (style: string) => void;
  setModel: (model: string) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  addGeneration: (generation: ImageGeneration) => void;
  setGenerations: (generations: ImageGeneration[]) => void;
  setCredits: (credits: number) => void;
}

export const useImageStudioStore = create<ImageStudioState>((set) => ({
  prompt: "",
  ratio: "1:1",
  style: "illustration",
  model: "flux1",
  isGenerating: false,
  generations: [],
  credits: 0,

  setPrompt: (prompt) => set({ prompt }),
  setRatio: (ratio) => set({ ratio }),
  setStyle: (style) => set({ style }),
  setModel: (model) => set({ model }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  addGeneration: (generation) =>
    set((state) => ({
      generations: [generation, ...state.generations],
    })),
  setGenerations: (generations) => set({ generations }),
  setCredits: (credits) => set({ credits }),
}));
