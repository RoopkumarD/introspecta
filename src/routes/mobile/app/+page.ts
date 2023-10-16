import { stage } from "$lib/store";
import { redirect } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

export const load: PageLoad = () => {
  let stageVal: "Login" | "Dashboard";
  const unsubscribe = stage.subscribe((val) => {
    stageVal = val;
  });

  if (stageVal === "Login") {
    unsubscribe();
    throw redirect(307, "/mobile");
    return;
  }

  unsubscribe();
  return;
};
