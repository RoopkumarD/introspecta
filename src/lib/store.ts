import type { Entries } from "$lib/types";

import { derived, writable } from "svelte/store";

type Stage = "Login" | "Dashboard";

export const stage = writable<Stage>("Login");

export const entries = writable<Entries>({});

export const theme = writable<boolean>(false);

export const publicKeyStore = writable<string>("");
export const currentNotebook = writable<string>("");
export const desktopDrawer = writable<boolean>(true);

export const notebookEntries = derived(
  [entries, currentNotebook],
  ([$entries, $currentNotebook]) => {
    return Object.values($entries[$currentNotebook]).sort(
      (a, b) => b.timestamp - a.timestamp,
    );
  },
);
