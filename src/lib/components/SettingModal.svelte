<script lang="ts">
  import { notebooks } from "$lib/store";
  import toast from "svelte-french-toast";
  export let showModal: boolean;

  let dialog: HTMLDialogElement;

  let newJournalName = "";

  function addNewJournal() {
    if (newJournalName === "") {
      toast.error("atleast give me a name for it");
      return;
    }

    $notebooks = [...$notebooks, newJournalName];

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
        {#each $notebooks as notebook}
          <p class={`${randomColor()} w-min p-1 rounded-md`}>{notebook}</p>
        {/each}
      </div>
      <p class="underline mt-1">Add new journal:</p>
      <div class="my-1">
        <input
          type="text"
          bind:value={newJournalName}
          placeholder="name of journal..."
          class="border-2 border-base-300 p-1 mb-2 xl:mb-0"
        />
        <button on:click={addNewJournal} class="btn btn-sm btn-secondary"
          >add</button
        >
      </div>
      <p class="underline">Delete journal:</p>
      <p class="mb-2">
        App will automatically delete the journal, if the journal is empty
      </p>

      <h1 class="font-bold text-xl mb-2 border-b-[1px] border-base-300">
        Backup/Sync
      </h1>
      <div class="join join-vertical w-full rounded-none">
        <div class="collapse collapse-arrow join-item border border-base-300">
          <input type="radio" name="my-accordion-4" />
          <div class="collapse-title text-md font-medium">
            0. Why you should backup/sync data to your google drive account?
          </div>
          <div class="collapse-content">
            <p>
              The reason i am asking you to store the data in your drive account
              is because if there is some mishap and you delete the browser or
              clear data of it. The diary records saved in the browser also gets
              deleted. To mitigate this, i introduce backing up to google drive
              feature.
            </p>
          </div>
        </div>

        <div class="collapse collapse-arrow join-item border border-base-300">
          <input type="radio" name="my-accordion-4" checked="checked" />
          <div class="collapse-title text-md font-medium">
            1. Why do you have to login each time you want to sync?
          </div>
          <div class="collapse-content">
            <p>
              No, not each time but each app session. The reason why you have
              login is because i have to show google your consent that you allow
              me to add stuff to your google drive account.
            </p>
          </div>
        </div>
        <div class="collapse collapse-arrow join-item border border-base-300">
          <input type="radio" name="my-accordion-4" />
          <div class="collapse-title text-md font-medium">
            2. What is an app session?
          </div>
          <div class="collapse-content">
            <p>
              This term refers to every time you open this web app. If you use
              this app in multiple tabs, each tab counts as its own separate app
              session. The app session also comes to an end when you either
              navigate to a different page or close the tab. So, every time you
              start, switch, or finish using this app, that's considered a
              separate app session.
            </p>
          </div>
        </div>
        <div class="collapse collapse-arrow join-item border border-base-300">
          <input type="radio" name="my-accordion-4" />
          <div class="collapse-title text-md font-medium">
            3. When you should ideally sync/backup data?
          </div>
          <div class="collapse-content">
            <p>
              It's completely up to you to decide. If you've written some
              entries on another device and you want to bring those entries into
              this browser, that's a good time to sync. Similarly, if you've
              finished today's reflections and want to ensure your data is
              safely backed up, you can also sync at that point, and so on.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</dialog>
