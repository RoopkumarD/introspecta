<script lang="ts">
  import { entries, currentNotebook, notebooks } from "$lib/store";
  import type { Entries, EntryType } from "$lib/types";
  import ThemeChooser from "$lib/components/ThemeChooser.svelte";
  import Entry from "./Entry.svelte";
  import SettingModal from "$lib/components/SettingModal.svelte";

  let showModal = false;
  let notebookEntries: EntryType[] = [];

  $: {
    let entriesArr = Object.values($entries);

    let tmpArr: EntryType[] = entriesArr.filter(
      (entry) => entry.notebook === $currentNotebook
    );

    tmpArr.sort((a, b) => b.timestamp - a.timestamp);

    notebookEntries = tmpArr;
  }

  function choosedJournal(journal: string) {
    $currentNotebook = journal;
    notebookEntries = getEntriesList($entries);
    return;
  }

  function getEntriesList(entries: Entries) {
    let entriesArr = Object.values(entries);

    let tmpArr: EntryType[] = entriesArr.filter(
      (entry) => entry.notebook === $currentNotebook
    );

    tmpArr.sort((a, b) => b.timestamp - a.timestamp);

    return tmpArr;
  }
</script>

<SettingModal bind:showModal />

<div class="py-2 px-6">
  <div class="flex justify-between items-center">
    <button
      on:click={() => (showModal = true)}
      class="btn btn-circle btn-ghost !rounded-full"
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
        class="lucide lucide-settings w-8 h-8"
        ><path
          d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
        /><circle cx="12" cy="12" r="3" /></svg
      >
    </button>
    <button class="btn btn-circle btn-ghost !rounded-full">
      <ThemeChooser />
    </button>
  </div>
  <details class="dropdown my-4 drop-shadow">
    <summary class="m-1 btn btn-neutral w-56 flex justify-between"
      ><span>{$currentNotebook}</span><span
        ><svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6" /></svg
        ></span
      ></summary
    >
    <ul class="p-2 shadow menu dropdown-content z-[1] bg-base-100 ml-1 w-56">
      {#each $notebooks as notebook}
        <li class="p-2">
          <button
            class="rounded-none uppercase"
            on:click={() => choosedJournal(notebook)}>{notebook}</button
          >
        </li>
      {/each}
      <li class="p-2 font-medium">
        You can create more journals, just go to settings
      </li>
    </ul>
  </details>
  <div id="entries" class="h-[calc(100vh-160px)] space-y-2 overflow-y-auto">
    {#each notebookEntries as entry (entry.id)}
      <Entry
        id={entry.id}
        title={entry.title}
        content={entry.content}
        timestamp={entry.timestamp}
      />
    {/each}
  </div>
</div>
