<script lang="ts">
  import { goto } from "$app/navigation";
  import { createStore, del } from "idb-keyval";
  import toast from "svelte-french-toast";
  import { entries as entriesVal } from "$lib/store";

  export let isNew: boolean, id: string;

  const entriesStore = createStore("introspecta", "entries");

  async function deleteLog() {
    if (isNew === true) {
      // going back to home
      goto("/mobile/app");
      return;
    }

    try {
      await del(id, entriesStore);
    } catch (err) {
      toast.error("Err while deleting entry from indexeddb");
      return;
    }

    delete $entriesVal[id];

    goto("/mobile/app");
  }
</script>

<button on:click={deleteLog} class="btn btn-sm btn-warning">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="lucide lucide-trash-2"
    ><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path
      d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"
    /><line x1="10" x2="10" y1="11" y2="17" /><line
      x1="14"
      x2="14"
      y1="11"
      y2="17"
    /></svg
  >
</button>
