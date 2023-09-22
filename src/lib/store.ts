import { writable } from "svelte/store";

type Stage = "Login" | "Dashboard";

const stage = writable<Stage>("Dashboard");

const userInfo = writable({
  pubKey: "",
});

const blog = writable({
  id: "",
  title: "",
  content: "",
});

export { stage, userInfo, blog };
