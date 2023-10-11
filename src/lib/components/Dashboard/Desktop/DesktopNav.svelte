<script lang="ts">
  import { blog, journalling } from "$lib/store";
  import { Toaster } from "svelte-french-toast";

  import SaveEntry from "./SaveEntry.svelte";
  import DeleteEntry from "./DeleteEntry.svelte";
  import SyncEntries from "./SyncEntries.svelte";

  export let drawerOpen: boolean;

  let syncModalShow = false;

  function goToHome() {
    $blog.id = "";
    $blog.title = "";
    $blog.content = "";
    $journalling.updateIndex = -1;

    $blog.writeBlog = false;
  }
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
  {:else}
    <button
      id="menu"
      on:click={() => (drawerOpen = !drawerOpen)}
      class="btn btn-square btn-ghost ml-4"
    >
      Menu
    </button>

    <div id="operations" class="flex items-center gap-4 mr-4">
      <div class="tooltip tooltip-bottom font-bold" data-tip="Go Back Home">
        <button on:click={goToHome} class="btn btn-square">
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
            class="lucide lucide-home"
            ><path
              d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
            /><polyline points="9 22 9 12 15 12 15 22" /></svg
          >
        </button>
      </div>

      <DeleteEntry />
      <SaveEntry />
    </div>
  {/if}
</nav>
