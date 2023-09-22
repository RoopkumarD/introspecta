<script lang="ts">
  export let showModal: boolean;

  let dialog: HTMLDialogElement;

  $: if (dialog && showModal) dialog.showModal();
</script>

<dialog class="modal" bind:this={dialog} on:close={() => (showModal = false)}>
  <div class="modal-box">
    <div class="flex justify-between items-center">
      <h1 class="font-abrilFatFace">settings</h1>
      <button on:click={() => dialog.close()} class="btn btn-ghost btn-sm"
        >close</button
      >
    </div>
    <div class="flex mt-4 gap-4">
      <div id="sidebar" class="flex flex-col p-4 gap-2 bg-base-200">
        <button class="btn">general</button>
        <button class="btn">backup</button>
        <button class="btn">feedback</button>
      </div>
      <div>content</div>
    </div>
  </div>
</dialog>
