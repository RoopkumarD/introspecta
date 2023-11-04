<script lang="ts">
  let showNextSteps: boolean = false;

  function deleteSyncRelatedData() {
    localStorage.removeItem("fileId");
    localStorage.removeItem("dataHash");
    localStorage.removeItem("lastSyncTime");
    showNextSteps = true;
    return;
  }
</script>

<div id="backup-sync-change" class="">
  <h3 class="font-bold text-lg mb-2 underline">
    Use Different Account for Backup/Sync
  </h3>
  <p>
    This will enable you to synchronize/backup entries to a different account
  </p>

  <button on:click={deleteSyncRelatedData} class="btn btn-warning my-2"
    >Delete Sync related data</button
  >

  {#if showNextSteps}
    <div
      id="next-msg"
      class="my-2 space-y-1 bg-base-300 p-2 font-medium rounded-md"
    >
      <p>Done :)</p>
      <p>Now, the next time you sync/backup, you can use a different account</p>
      <p>
        Don't forget to delete the 'introspecta-data.msp' file from your Google
        Drive storage of previous account
      </p>
    </div>
  {/if}
</div>
