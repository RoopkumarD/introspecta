import { get } from "svelte/store";
import type { PageLoad } from "../$types";
import { entries, currentNotebook } from "$lib/store";

export const load: PageLoad = ({ params }) => {
  const id = params.id;
  const entriesVal = get(entries);

  if (entriesVal[id] === undefined) {
    return {
      id: id,
      title: "",
      content: "",
      timestamp: null,
      notebook: get(currentNotebook),
      isNew: true,
    };
  } else {
    return {
      id: id,
      title: entriesVal[id].title,
      content: entriesVal[id].content,
      timestamp: entriesVal[id].timestamp,
      notebook: entriesVal[id].notebook,
      isNew: false,
    };
  }
};
