<script lang="ts">
  import { desktopDrawer, currentNotebook } from "$lib/store";
  import SettingModal from "$lib/components/Diary/SettingModal.svelte";
  import SyncEntries from "$lib/components/Diary/SyncEntries.svelte";
  import ThemeChooser from "$lib/components/ThemeChooser.svelte";
  import CreateEntry from "$lib/components/Diary/CreateEntry.svelte";
  import SettingsButton from "$lib/components/Diary/SettingsButton.svelte";
  import SyncButton from "$lib/components/Diary/SyncButton.svelte";
  import EntriesByNotebook from "$lib/components/Diary/EntriesByNotebook.svelte";
  import NotebookModal from "$lib/components/Diary/NotebookModal.svelte";

  let showModal = false;
  let syncModalShow = false;
  let notebookModal = false;
</script>

<SettingModal bind:showModal />
<SyncEntries bind:syncModalShow />
<NotebookModal bind:showModal={notebookModal} />

<div class="py-2 px-4 xl:hidden">
  <div class="flex justify-between items-center">
    <div>
      <SettingsButton bind:showModal />
      <ThemeChooser />
    </div>
    <SyncButton bind:syncModalShow />
  </div>
  <button
    on:click={() => (notebookModal = true)}
    class="btn btn-neutral w-full flex justify-between my-4"
    ><span>{$currentNotebook}</span><svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="lucide lucide-plus"><path d="M5 12h14" /><path d="M12 5v14" /></svg
    ></button
  >

  <div id="entries" class="h-[calc(100vh-160px)] space-y-2 overflow-y-auto">
    <CreateEntry />
    <EntriesByNotebook />
  </div>
</div>
<div class="hidden xl:block">
  <nav
    class="flex items-center justify-between border-b-[1px] border-base-300 pb-2 pt-2 px-4"
  >
    <button
      id="menu"
      on:click={() => ($desktopDrawer = !$desktopDrawer)}
      class="btn btn-ghost btn-square ml-4"
    >
      {#if $desktopDrawer === true}
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
          class="lucide lucide-panel-right-open"
          ><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><line
            x1="15"
            x2="15"
            y1="3"
            y2="21"
          /><path d="m10 15-3-3 3-3" /></svg
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
          class="lucide lucide-panel-left-open"
          ><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><path
            d="M9 3v18"
          /><path d="m14 9 3 3-3 3" /></svg
        >
      {/if}
    </button>
    <p id="date" class="text-xl ml-14 mt-1">
      {new Date().toDateString()}
    </p>
    <SyncButton bind:syncModalShow />
  </nav>

  <main class="h-[calc(100vh-66px)] flex justify-center items-center">
    <CreateEntry />
  </main>
</div>
