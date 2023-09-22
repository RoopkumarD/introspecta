<script lang="ts">
  import Entry from "./Entry.svelte";
  import SettingModal from "./SettingModal.svelte";

  let journals = ["default", "roop", "das"];
  let entries: {
    id: string;
    title: string;
    content: string;
    timestamp: number;
  }[] = [];
  let showModal = false;

  for (let i = 0; i < 10; i++) {
    let object = {
      id: crypto.randomUUID(),
      title: "Title of entry",
      content:
        "COntent of entry which will of few lines and i will clamp them later on and make it samll and very small and i hope to make it more small",
      timestamp: new Date().getTime(),
    };

    entries.push(object);
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
      <label class="swap swap-rotate">
        <!-- this hidden checkbox controls the state -->
        <input type="checkbox" />

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
  <details class="dropdown my-4">
    <summary class="m-1 btn btn-neutral w-56 flex justify-between"
      ><span>{journals[0]}</span><span
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
      {#each journals as journal}
        <li class="hover:bg-base-200 p-2">{journal}</li>
      {/each}
    </ul>
  </details>
  <div id="entries" class="h-[calc(100vh-160px)] space-y-2 overflow-y-auto">
    {#each entries as entry (entry.id)}
      <Entry {...entry} />
    {/each}
  </div>
</div>
