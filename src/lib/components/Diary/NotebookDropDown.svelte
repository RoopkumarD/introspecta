<script lang="ts">
  import { currentNotebook, notebooks } from "$lib/store";

  function choosedJournal(journal: string) {
    $currentNotebook = journal;
    return;
  }
</script>

<details class="dropdown my-4 drop-shadow w-full">
  <summary class="btn btn-neutral w-full flex justify-between"
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
  <ul class="p-2 shadow menu dropdown-content z-[2] bg-base-100 w-full">
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
