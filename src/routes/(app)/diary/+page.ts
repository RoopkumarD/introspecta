import { stage } from "$lib/store";
import { redirect } from "@sveltejs/kit";
import type { PageLoad } from "./$types";
import { get } from "svelte/store";

export const load: PageLoad = () => {
  let stageVal: "Login" | "Dashboard" = get(stage);

  if (stageVal === "Login") {
    throw redirect(307, "/unlock-diary");
  }

  return;
};
