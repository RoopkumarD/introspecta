<script lang="ts">
  export let showModal: boolean,
    warningTitle: string,
    warningString: string,
    warningButtonString: string,
    warningAction: (permissionGiven: boolean) => void,
    createDiaryWarning: boolean;

  let dialog: HTMLDialogElement;

  $: if (dialog && showModal) dialog.showModal();
</script>

<dialog class="modal" bind:this={dialog} on:close={() => (showModal = false)}>
  <div class="modal-box leading-2">
    <div
      class="border-b-2 border-neutral pb-2 flex justify-between items-center"
    >
      <h3 class="font-semibold text-xl">{warningTitle}</h3>
      <button on:click={() => dialog.close()} class="btn btn-warning btn-sm"
        >cancel</button
      >
    </div>
    <p class="font-medium mt-6">
      {warningString}
    </p>
    {#if createDiaryWarning === false}
      <p class="text-error text-sm mt-1">
        *Note that this action is irreversible. You won't be able to recover
        this entry later
      </p>
    {/if}
    <button
      on:click={() => {
        warningAction(true);
      }}
      class={`${
        createDiaryWarning === true ? "btn-accent" : "btn-error"
      } btn grow w-full font-bold mt-6`}>{warningButtonString}</button
    >
  </div>
</dialog>
