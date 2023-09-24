<script lang="ts">
  import { journalling } from "$lib/store";
  import Entry from "./Entry.svelte";
  import SettingModal from "./SettingModal.svelte";
  import { onMount } from "svelte";

  let showModal = false;

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
  <details class="dropdown my-4 drop-shadow">
    <summary class="m-1 btn btn-neutral w-56 flex justify-between"
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
    <ul class="p-2 shadow menu dropdown-content z-[1] bg-base-100 ml-1 w-56">
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
