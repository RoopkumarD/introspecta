import type { Entries } from "$lib/types";

import { derived, writable } from "svelte/store";

type Stage = "Login" | "Dashboard";

const stage = writable<Stage>("Login");

const entries = writable<Entries>({});

const publicKeyStore = writable<string>("");
const currentNotebook = writable<string>("");
const desktopDrawer = writable<boolean>(false);

const notebookEntries = derived(
  [entries, currentNotebook],
  ([$entries, $currentNotebook]) => {
    return Object.values($entries[$currentNotebook]).sort(
      (a, b) => b.timestamp - a.timestamp,
    );
  },
);

export {
  stage,
  entries,
  notebookEntries,
  publicKeyStore,
  currentNotebook,
  desktopDrawer,
};
