<script lang="ts">
  import { genShortUUID } from "$lib/utils";
  import toast, { Toaster } from "svelte-french-toast";
  import SyncEntries from "$lib/components/SyncEntries.svelte";
  import { desktopDrawer } from "$lib/store";
  import { goto } from "$app/navigation";
  import { entries } from "$lib/store";

  let syncModalShow = false;

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

    goto(`/desktop/app/${id}`);
  }
</script>

<Toaster />

<SyncEntries bind:syncModalShow />

<nav
  class="flex items-center justify-between border-b-[1px] border-base-300 pb-2 pt-2 px-4"
>
  <button
    id="menu"
    on:click={() => ($desktopDrawer = !$desktopDrawer)}
    class="btn btn-ghost btn-square ml-4"
  >
    menu
  </button>
  <p id="date" class="text-xl ml-14 mt-1">
    {new Date().toDateString()}
  </p>
  <button
    on:click={() => (syncModalShow = true)}
    class="btn btn-sm text-xl mr-4"
  >
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
      class="lucide lucide-upload-cloud"
      ><path
        d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"
      /><path d="M12 12v9" /><path d="m16 16-4-4-4 4" /></svg
    >
    <span class="lowercase mb-1">sync?</span></button
  >
</nav>

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
