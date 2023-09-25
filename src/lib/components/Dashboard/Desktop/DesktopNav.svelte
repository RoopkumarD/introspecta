<script lang="ts">
  import { blog, journalling } from "$lib/store";
  import { createStore, del, set, update } from "idb-keyval";
  import { onMount, onDestroy } from "svelte";
  import encrypt from "$lib/encrypt?worker";
  import toast, { Toaster } from "svelte-french-toast";
  import { wrap } from "comlink";
  export let drawerOpen: boolean;

  function goToHome() {
    $blog.id = "";
    $blog.title = "";
    $blog.content = "";

    $blog.writeBlog = false;
  }

  const entriesStore = createStore("introspecta", "entries");

  async function saveLog() {
    const timestamp = new Date().getTime();

    if ($journalling.updateIndex !== -1) {
      const { encrypted } = await workerApi.encryptLog(
        JSON.stringify({
          title: $blog.title,
          content: $blog.content,
          timestamp: timestamp,
          journal: $blog.journal,
        }),
        $journalling.pubKey
      );

      try {
        await update(
          $blog.id,
          (val) => {
            return {
              id: $blog.id,
              entry: encrypted,
            };
          },
          entriesStore
        );
      } catch (err) {
        toast.error("Err while saving entry to indexeddb");
        return;
      }

      // updating ui
      $journalling.entries[$blog.journal].splice($journalling.updateIndex, 1);
      $journalling.entries[$blog.journal] = [
        {
          id: $blog.id,
          log: {
            title: $blog.title,
            content: $blog.content,
            timestamp: timestamp,
            journal: $blog.journal,
          },
        },
        ...$journalling.entries[$blog.journal],
      ];

      $journalling.updateIndex = -1;
    } else {
      const { encrypted } = await workerApi.encryptLog(
        JSON.stringify({
          title: $blog.title,
          content: $blog.content,
          timestamp: timestamp,
          journal: $journalling.currentJournal,
        }),
        $journalling.pubKey
      );

      try {
        await set($blog.id, { id: $blog.id, entry: encrypted }, entriesStore);
      } catch (err) {
        toast.error("Err while saving entry to indexeddb");
        return;
      }

      // updating ui
      $journalling.entries[$blog.journal] = [
        {
          id: $blog.id,
          log: {
            title: $blog.title,
            content: $blog.content,
            timestamp: timestamp,
            journal: $blog.journal,
          },
        },
        ...$journalling.entries[$blog.journal],
      ];
    }
    console.log($journalling.entries);

    goToHome();
  }

  async function deleteLog() {
    if ($journalling.updateIndex === -1) {
      goToHome();
    }

    try {
      await del($blog.id, entriesStore);
    } catch (err) {
      toast.error("Err while deleting entry from indexeddb");
      return;
    }

    $journalling.entries[$blog.journal].splice($journalling.updateIndex, 1);

    $journalling.updateIndex = -1;
    goToHome();
  }

  interface WorkerApi {
    encryptLog: (
      entry: string,
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
    <button class="btn btn-sm text-xl">
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
      <button on:click={saveLog} class="btn btn-square btn-success">
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
          class="lucide lucide-save"
          ><path
            d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"
          /><polyline points="17 21 17 13 7 13 7 21" /><polyline
            points="7 3 7 8 15 8"
          /></svg
        >
      </button>
    </div>
  {/if}
</nav>
