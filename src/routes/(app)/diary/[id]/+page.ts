import { get } from "svelte/store";
import { redirect } from "@sveltejs/kit";
import type { PageLoad } from "./$types";
import { entries, currentNotebook, stage } from "$lib/store";

export const load: PageLoad = ({ params }) => {
  const stageVal = get(stage);

  if (stageVal === "Login") {
    throw redirect(307, "/unlock-diary");
  }

  const id = params.id;
  const entriesVal = get(entries);
  const notebook = get(currentNotebook);

  if (entriesVal[notebook][id] === undefined) {
    return {
      id: id,
      title: "",
      content: "",
      timestamp: null,
      notebook: notebook,
      isNew: true,
    };
  } else {
    return {
      id: id,
      title: entriesVal[notebook][id].title,
      content: entriesVal[notebook][id].content,
      timestamp: entriesVal[notebook][id].timestamp,
      notebook: entriesVal[notebook][id].notebook,
      isNew: false,
    };
  }
};
