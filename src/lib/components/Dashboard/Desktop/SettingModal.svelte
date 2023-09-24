<script lang="ts">
  import { journalling } from "$lib/store";
  import toast, { Toaster } from "svelte-french-toast";
  export let showModal: boolean;

  let dialog: HTMLDialogElement;

  let newJournalName = "";

  function addNewJournal() {
    if (newJournalName === "") {
      toast.error("atleast give me a name for it");
      return;
    }

    $journalling.journals = [...$journalling.journals, newJournalName];
    $journalling.entries[newJournalName] = [];

    newJournalName = "";
    return;
  }

  function randomColor() {
    let index = Math.floor(Math.random() * 3);

    if (index === 0) {
      return "bg-primary";
    } else if (index === 1) {
      return "bg-secondary";
    } else if (index === 2) {
      return "bg-accent";
    }
  }

  $: if (dialog && showModal) dialog.showModal();
</script>

<Toaster />

<dialog class="modal" bind:this={dialog} on:close={() => (showModal = false)}>
  <div class="modal-box h-96 overflow-y-auto">
    <div class="flex justify-between items-center">
      <h1 class="font-abrilFatFace">settings</h1>
      <button on:click={() => dialog.close()} class="btn btn-ghost btn-sm"
        >close</button
      >
    </div>
    <div class="mt-2">
      <h1 class="font-bold text-xl mb-2 border-b-[1px] border-base-300">
        General
      </h1>
      <p class="underline mb-1">All journals:</p>
      <div class="flex flex-wrap gap-2">
        {#each $journalling.journals as journals}
          <p class={`${randomColor()} w-min p-1 rounded-md`}>{journals}</p>
        {/each}
      </div>
      <p class="underline mt-1">Add new journal:</p>
      <div class="my-1">
        <input
          type="text"
          bind:value={newJournalName}
          placeholder="name of journal..."
          class="border-2 border-base-300 p-1"
        />
        <button on:click={addNewJournal} class="btn btn-sm btn-secondary"
          >add</button
        >
      </div>
      <p class="underline">Delete journal:</p>
      <p class="mb-2">
        App will automatically delte the journal, if the journal is empty
      </p>

      <h1 class="font-bold text-xl mb-2 border-b-[1px] border-base-300">
        Backup/Sync
      </h1>
      <p>Comming soon...</p>
    </div>
  </div>
</dialog>
