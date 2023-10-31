<script lang="ts">
  import toast from "svelte-french-toast";
  import { goto } from "$app/navigation";
  import { genShortUUID } from "$lib/utils";
  import { entries } from "$lib/store";

  // create new log
  function getId() {
    let id = genShortUUID();

    if ($entries[id] !== undefined) {
      console.error("Used id was generated");
      return null;
    }

    return id;
  }

  function createLog() {
    let id = getId();

    if (id === null) {
      toast.error(
        "Wasn't able to create new log due to id generate, retry again"
      );
      return;
    }

    goto(`/diary/${id}`);
  }
</script>

<button
  on:click={createLog}
  class="btn btn-block xl:w-[400px] text-2xl py-4 h-max xl:text-4xl xl:drop-shadow-sm xl:p-4"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="3"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="xl:w-10 xl:h-10 lucide lucide-pen-square"
    ><path
      d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
    /><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z" /></svg
  >
  <span class="font-medium xl:font-bold">Create a log</span>
</button>
