<script lang="ts">
  import { journalling, blog } from "$lib/store";
  import { genShortUUID } from "$lib/utils";
  import Entry from "$lib/components/Mobile/Dashboard/Entry.svelte";
  import SettingModal from "$lib/components/Dashboard/Desktop/SettingModal.svelte";
  import SyncEntries from "$lib/components/Dashboard/Desktop/SyncEntries.svelte";
  import { onMount } from "svelte";
  import toast, { Toaster } from "svelte-french-toast";
  import { goto } from "$app/navigation";

  // create new log
  function getId() {
    if ($journalling.usedIds === undefined) {
      console.error("usedIds is undefined");
      return null;
    }

    let id = genShortUUID();

    if ($journalling.usedIds.has(id)) {
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

    $blog.id = id;
    $blog.title = "";
    $blog.content = "";
    $blog.journal = $journalling.currentJournal;

    goto(`/mobile/app/${id}`);
  }

  let showModal = false;
  let syncModalShow = false;

  function choosedJournal(journal: string) {
    $journalling.currentJournal = journal;
    return;
  }

  let themeSelected: boolean;

  function updateTheme() {
    const one_year = 60 * 60 * 24 * 365;

    if (themeSelected === false) {
      localStorage.setItem("theme", "cupcake");
      document.cookie = `theme=cupcake; max-age=${one_year}; path=/; SameSite=Lax`;
      document.documentElement.setAttribute("data-theme", "cupcake");
    } else if (themeSelected === true) {
      localStorage.setItem("theme", "business");
      document.cookie = `theme=business; max-age=${one_year}; path=/; SameSite=Lax`;
      document.documentElement.setAttribute("data-theme", "business");
    }
  }

  onMount(() => {
    const theme = localStorage.getItem("theme");

    if (theme === null) {
      themeSelected = true;
      localStorage.setItem("theme", "cupcake");
      const one_year = 60 * 60 * 24 * 365;
      document.cookie = `theme=cupcake; max-age=${one_year}; path=/; SameSite=Lax`;
    } else {
      if (theme === "cupcake") {
        themeSelected = true;
      } else if (theme === "business") {
        themeSelected = false;
      }
    }
  });
</script>

<Toaster />

<SettingModal bind:showModal />
<SyncEntries bind:syncModalShow />

<div class="py-2 px-4">
  <div class="flex justify-between items-center">
    <div>
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
        <label class="swap swap-rotate">
          <!-- this hidden checkbox controls the state -->
          <input
            type="checkbox"
            on:change={updateTheme}
            bind:checked={themeSelected}
          />

          <!-- sun icon -->
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
            class="lucide lucide-sun swap-on w-8 h-8"
            ><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path
              d="M12 20v2"
            /><path d="m4.93 4.93 1.41 1.41" /><path
              d="m17.66 17.66 1.41 1.41"
            /><path d="M2 12h2" /><path d="M20 12h2" /><path
              d="m6.34 17.66-1.41 1.41"
            /><path d="m19.07 4.93-1.41 1.41" /></svg
          >

          <!-- moon icon -->
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
            class="lucide lucide-moon swap-off h-8 w-8"
            ><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg
          >
        </label>
      </button>
    </div>
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
  </div>
  <details class="dropdown my-4 drop-shadow w-full">
    <summary class="btn btn-neutral w-full flex justify-between"
      ><span>{$journalling.currentJournal}</span><span
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
    <ul class="p-2 shadow menu dropdown-content z-[2] bg-base-100 w-full">
      {#each $journalling.journals as journal}
        <li class="p-2">
          <button
            class="rounded-none uppercase"
            on:click={() => choosedJournal(journal)}>{journal}</button
          >
        </li>
      {/each}
      <li class="p-2 font-medium">
        You can create more journals, just go to settings
      </li>
    </ul>
  </details>
  <div id="entries" class="h-[calc(100vh-160px)] space-y-2 overflow-y-auto">
    <button on:click={createLog} class="btn btn-block text-2xl py-4 h-max">
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
        class="lucide lucide-pen-square"
        ><path
          d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
        /><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z" /></svg
      >
      <span class="font-medium">Create a log</span>
    </button>

    {#each $journalling.entries[$journalling.currentJournal] as entry, index (entry.id)}
      <Entry
        id={entry.id}
        {index}
        title={entry.log.title}
        content={entry.log.content}
        timestamp={entry.log.timestamp}
        journal={entry.log.journal}
      />
    {/each}
  </div>
</div>
