import { writable } from "svelte/store";

type Stage = "Login" | "Dashboard";

const stage = writable<Stage>("Login");

interface entry {
  id: string;
  log: {
    title: string;
    content: string;
    timestamp: number;
    journal: string;
  };
}

interface entries {
  [journalName: string]: entry[];
}

interface Journalling {
  pubKey: string;
  currentJournal: string;
  updateIndex: number;
  journals: string[];
  entries: entries;
  currentLogs: entry[];
}

const journalling = writable<Journalling>({
  pubKey: "",
  currentJournal: "",
  updateIndex: -1,
  journals: [],
  entries: {},
  currentLogs: [],
});

const blog = writable({
  id: "",
  title: "",
  content: "",
});

export { stage, blog, journalling };
