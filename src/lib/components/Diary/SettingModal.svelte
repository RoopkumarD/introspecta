<script lang="ts">
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
    <div>
      <h3 class="font-bold text-xl mb-2 underline">Backup/Sync</h3>
      <div class="join join-vertical w-full rounded-none">
        <div class="collapse collapse-arrow join-item">
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
        <div class="collapse collapse-arrow join-item">
          <input type="radio" name="my-accordion-4" />
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
        <div class="collapse collapse-arrow join-item">
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
        <div class="collapse collapse-arrow join-item">
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
