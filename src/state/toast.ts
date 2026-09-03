/**
 * A one-line, self-clearing confirmation banner. First of its kind in this
 * app — used so far only by Create's async submit, to say "you're in" the
 * instant you tap render, before the badge (see state/submission.ts) shows
 * up seconds later.
 */

import { create } from 'zustand';

type ToastState = {
  message: string | null;
  show: (message: string, ms?: number) => void;
  hide: () => void;
};

let timer: ReturnType<typeof setTimeout> | null = null;

export const useToast = create<ToastState>((set) => ({
  message: null,

  show: (message, ms = 2600) => {
    if (timer) clearTimeout(timer);
    set({ message });
    timer = setTimeout(() => set({ message: null }), ms);
  },

  hide: () => {
    if (timer) clearTimeout(timer);
    set({ message: null });
  },
}));
