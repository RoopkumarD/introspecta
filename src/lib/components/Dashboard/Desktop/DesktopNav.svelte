<script lang="ts">
  import { blog } from "$lib/store";
  export let drawerOpen: boolean, writeBlog: boolean;

  function goToHome() {
    $blog.id = "";
    $blog.title = "";
    $blog.content = "";

    writeBlog = false;
  }
</script>

<nav class="flex items-center justify-between pb-4 pt-2 px-4">
  {#if writeBlog === false}
    <button
      id="menu"
      on:click={() => (drawerOpen = !drawerOpen)}
      class="btn btn-circle btn-ghost !rounded-full"
    >
      {#if drawerOpen === false}
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
          class="w-8 h-8 lucide lucide-chevrons-right"
          ><path d="m6 17 5-5-5-5" /><path d="m13 17 5-5-5-5" /></svg
        >
      {:else}
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
          class="w-8 h-8 lucide lucide-chevrons-left"
          ><path d="m11 17-5-5 5-5" /><path d="m18 17-5-5 5-5" /></svg
        >
      {/if}
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
      <button class="btn btn-square btn-warning">
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
      <button class="btn btn-square btn-success">
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
