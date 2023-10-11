<script lang="ts">
  import { blog, journalling } from "$lib/store";
  import { genShortUUID } from "$lib/utils";
  import toast, { Toaster } from "svelte-french-toast";

  function getId() {
    if ($journalling.usedIds === undefined) {
      console.error("usedIds is undefined");
      return null;
    }

    for (let i = 0; i < 10; i++) {
      let id = genShortUUID();

      if (!$journalling.usedIds.has(id)) {
        return id;
      }
    }

    console.error(
      "All the 10 consecutive generated keys are already present in db, heavy problem"
    );
    return null;
  }

  function createLog() {
    let id = getId();

    if (id === null) {
      toast.error("Wasn't able to create new log due to id prob, contact me");
      return;
    }

    $blog.id = id;
    $blog.title = "";
    $blog.content = "";
    $blog.journal = $journalling.currentJournal;

    $blog.writeBlog = true;
  }
</script>

<Toaster />

<main class="h-[calc(100vh-66px)] flex justify-center items-center">
  <button on:click={createLog} class="text-4xl h-max btn drop-shadow-sm p-4">
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
      class="w-10 h-10 lucide lucide-pen-square"
      ><path
        d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
      /><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z" /></svg
    >
    <span class="font-bold">Create a log</span>
  </button>
</main>
