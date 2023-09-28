<script lang="ts">
  import { blog } from "$lib/store";
  import { onMount, onDestroy } from "svelte";
  import encrypt from "$lib/encrypt?worker";
  import { Toaster } from "svelte-french-toast";
  import { wrap } from "comlink";

  import SaveEntry from "./SaveEntry.svelte";
  import DeleteEntry from "./DeleteEntry.svelte";
  import SyncEntries from "./SyncEntries.svelte";

  export let drawerOpen: boolean;

  let syncModalShow = false;

  function goToHome() {
    $blog.id = "";
    $blog.title = "";
    $blog.content = "";

    $blog.writeBlog = false;
  }

  interface WorkerApi {
    encryptLog: (
      entry: Buffer,
      pubKey: string
    ) => Promise<{ encrypted: string }>;
  }
  let worker: Worker | undefined;
  let workerApi: WorkerApi;
  onMount(() => {
    worker = new encrypt();
    workerApi = wrap<WorkerApi>(worker);
  });

  onDestroy(() => {
    worker?.terminate();
  });
</script>

<Toaster />

<SyncEntries bind:syncModalShow />

<nav
  class="flex items-center justify-between border-b-[1px] border-base-300 pb-2 pt-2 px-4"
>
  {#if $blog.writeBlog === false}
    <button
      id="menu"
      on:click={() => (drawerOpen = !drawerOpen)}
      class="btn btn-ghost btn-square"
    >
      menu
    </button>
    <p id="date" class="text-xl ml-14 mt-1">
      {new Date().toDateString()}
    </p>
    <button on:click={() => (syncModalShow = true)} class="btn btn-sm text-xl">
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
  {:else}
    <button on:click={goToHome} class="btn btn-ghost btn-square ml-4"
      >back</button
    >

    <button
      id="menu"
      on:click={() => (drawerOpen = !drawerOpen)}
      class="btn btn-square btn-ghost"
    >
      Menu
    </button>

    <div id="operations" class="flex items-center gap-4 mr-4">
      <DeleteEntry />
      <SaveEntry encryptLog={workerApi.encryptLog} />
    </div>
  {/if}
</nav>
