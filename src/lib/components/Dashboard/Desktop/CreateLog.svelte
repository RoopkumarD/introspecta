<script lang="ts">
  import { blog } from "$lib/store";
  export let writeBlog: boolean;

  function createLog() {
    $blog.id = crypto.randomUUID();
    $blog.title = "";
    $blog.content = "";

    writeBlog = true;
  }
</script>

<main class="h-[calc(100vh-80px)] flex justify-center items-center">
  <button
    on:click={createLog}
    class="text-4xl drop-shadow p-4 rounded-md flex gap-3 bg-base-200"
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
      class="w-10 h-10 lucide lucide-pen-square"
      ><path
        d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
      /><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z" /></svg
    >
    <span class="font-bold uppercase">Create a log</span>
  </button>
</main>
