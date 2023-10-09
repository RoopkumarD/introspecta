<script lang="ts">
  import { blog, journalling } from "$lib/store";
  import { createStore, del } from "idb-keyval";
  import toast from "svelte-french-toast";

  const entriesStore = createStore("introspecta", "entries");

  async function deleteLog() {
    console.log($journalling.updateIndex);
    if ($journalling.updateIndex === -1) {
      // going back to home
      $blog.id = "";
      $blog.title = "";
      $blog.content = "";

      $blog.writeBlog = false;
      return;
    }

    try {
      await del($blog.id, entriesStore);
    } catch (err) {
      toast.error("Err while deleting entry from indexeddb");
      return;
    }

    $journalling.entries[$blog.journal].splice($journalling.updateIndex, 1);

    $journalling.updateIndex = -1;

    // going back to home
    $blog.id = "";
    $blog.title = "";
    $blog.content = "";

    $blog.writeBlog = false;
  }
</script>

<div
  class="tooltip tooltip-bottom tooltip-warning font-bold"
  data-tip="Delete Entry"
>
  <button on:click={deleteLog} class="btn btn-square btn-warning">
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
      ><path d="M3 6h18" /><path
        d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"
      /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line
        x1="10"
        x2="10"
        y1="11"
        y2="17"
      /><line x1="14" x2="14" y1="11" y2="17" /></svg
    >
  </button>
</div>
