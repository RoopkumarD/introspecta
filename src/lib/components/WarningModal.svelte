<script lang="ts">
  import { warningValues, showModal } from "$lib/warningStore";

  let dialog: HTMLDialogElement;

  $: if (dialog && $showModal) dialog.showModal();
</script>

<dialog class="modal" bind:this={dialog} on:close={() => ($showModal = false)}>
  <div class="modal-box leading-2">
    <div
      class="border-b-2 border-neutral pb-2 flex justify-between items-center"
    >
      <h3 class="font-semibold text-xl">{$warningValues.title}</h3>
      <button on:click={() => dialog.close()} class="btn btn-warning btn-sm"
        >cancel</button
      >
    </div>
    <p class="font-medium mt-6">
      {$warningValues.content}
    </p>
    <p class="text-error text-sm mt-1">
      *Note that this action is irreversible. You won't be able to recover this
      entry later
    </p>
    <button
      on:click={() => {
        dialog.close();
        $warningValues.action(true);
      }}
      class="btn-error btn grow w-full font-bold mt-6"
      >{$warningValues.buttonString}</button
    >
  </div>
</dialog>
