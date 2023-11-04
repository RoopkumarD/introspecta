<script lang="ts">
  import BackupSyncChange from "./BackupSyncChange.svelte";
  import BackupSyncFaq from "./BackupSyncFAQ.svelte";
  import DeleteDiary from "./DeleteDiary.svelte";

  export let showModal: boolean;

  let dialog: HTMLDialogElement;

  $: if (dialog && showModal) dialog.showModal();
</script>

<dialog class="modal" bind:this={dialog} on:close={() => (showModal = false)}>
  <div class="modal-box">
    <div
      class="flex justify-between items-center border-b-2 border-neutral pb-2 mb-4"
    >
      <p class="font-semibold text-sm">Settings</p>
      <button on:click={() => dialog.close()} class="btn btn-ghost btn-sm"
        >close</button
      >
    </div>
    <div class="space-y-4">
      <BackupSyncChange />
      <div class="divider" />
      <BackupSyncFaq />
      <div class="divider" />
      <DeleteDiary />
    </div>
  </div>
</dialog>
