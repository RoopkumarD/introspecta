<script lang="ts">
  import { blog, journalling } from "$lib/store";
  import { createStore, del } from "idb-keyval";
  import toast from "svelte-french-toast";

  const entriesStore = createStore("introspecta", "entries");

  async function deleteLog() {
    if ($journalling.updateIndex === -1) {
      // going back to home
      $blog.id = "";
      $blog.title = "";
      $blog.content = "";

      $blog.writeBlog = false;
    }

    try {
      await del($blog.id, entriesStore);
    } catch (err) {
      toast.error("Err while deleting entry from indexeddb");
      return;
    }

    $journalling.entries[$blog.journal].splice($journalling.updateIndex, 1);

    $journalling.updateIndex = -1;

    const updateArr: string | null = localStorage.getItem("updateArr");
    if (updateArr !== null) {
      const arr: string[] = JSON.parse(updateArr);

      const index = arr.indexOf($blog.id);
      if (index !== -1) {
        arr.splice(index, 1);
        localStorage.setItem("updateArr", JSON.stringify(arr));
      }
    }

    const newArr: string | null = localStorage.getItem("newArr");
    const deleteArr: string | null = localStorage.getItem("deleteArr");
    if (newArr !== null) {
      const arr: string[] = JSON.parse(newArr);

      const index = arr.indexOf($blog.id);
      if (index !== -1) {
        arr.splice(index, 1);
        localStorage.setItem("newArr", JSON.stringify(arr));
      }

      if (deleteArr !== null) {
        const delArr: string[] = JSON.parse(deleteArr);

        if (!arr.includes($blog.id)) {
          delArr.push($blog.id);
          localStorage.setItem("deleteArr", JSON.stringify(delArr));
        }
      }
    }

    // going back to home
    $blog.id = "";
    $blog.title = "";
    $blog.content = "";

    $blog.writeBlog = false;
  }
</script>

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
