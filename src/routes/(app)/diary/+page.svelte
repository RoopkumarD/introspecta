<script lang="ts">
  import { desktopDrawer } from "$lib/store";
  import SettingModal from "$lib/components/Diary/SettingModal.svelte";
  import SyncEntries from "$lib/components/Diary/SyncEntries.svelte";
  import ThemeChooser from "$lib/components/ThemeChooser.svelte";
  import CreateEntry from "$lib/components/Diary/CreateEntry.svelte";
  import SettingsButton from "$lib/components/Diary/SettingsButton.svelte";
  import SyncButton from "$lib/components/Diary/SyncButton.svelte";
  import NotebookDropDown from "$lib/components/Diary/NotebookDropDown.svelte";
  import EntriesByNotebook from "$lib/components/Diary/EntriesByNotebook.svelte";

  let showModal = false;
  let syncModalShow = false;
</script>

<SettingModal bind:showModal />
<SyncEntries bind:syncModalShow />

<div class="py-2 px-4 xl:hidden">
  <div class="flex justify-between items-center">
    <div>
      <SettingsButton bind:showModal />
      <ThemeChooser />
    </div>
    <SyncButton bind:syncModalShow />
  </div>
  <NotebookDropDown />
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
      menu
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
