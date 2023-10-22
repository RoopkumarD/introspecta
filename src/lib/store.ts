import type { Entries } from "$lib/types";

import { writable } from "svelte/store";

type Stage = "Login" | "Dashboard";

const stage = writable<Stage>("Login");
const entries = writable<Entries>({});
const publicKeyStore = writable<string>("");
const currentNotebook = writable<string>("");
const notebooks = writable<string[]>([]);
const desktopDrawer = writable<boolean>(false);

export {
  stage,
  entries,
  publicKeyStore,
  currentNotebook,
  notebooks,
  desktopDrawer,
};
