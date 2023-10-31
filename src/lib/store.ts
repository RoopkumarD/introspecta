import type { Entries, EntryType } from "$lib/types";

import { derived, writable } from "svelte/store";

type Stage = "Login" | "Dashboard";

const stage = writable<Stage>("Login");
const entries = writable<Entries>({});
const publicKeyStore = writable<string>("");
const currentNotebook = writable<string>("");
const notebooks = writable<string[]>([]);
const desktopDrawer = writable<boolean>(false);
const notebookEntries = derived(
  [entries, currentNotebook],
  ([$entries, $currentNotebook]) => {
    let tmpArr: EntryType[] = [];
    if ($currentNotebook === "") {
      return tmpArr;
    }

    tmpArr = Object.values($entries).filter(
      (entry) => entry.notebook === $currentNotebook,
    );
    tmpArr.sort((a, b) => b.timestamp - a.timestamp);

    return tmpArr;
  },
);

export {
  stage,
  entries,
  notebookEntries,
  publicKeyStore,
  currentNotebook,
  notebooks,
  desktopDrawer,
};
