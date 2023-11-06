<script lang="ts">
  import { invalidateAll } from "$app/navigation";
  import { clear, createStore } from "idb-keyval";

  const entriesStore = createStore("introspecta", "entries");
  async function deleteCurrentDiary() {
    localStorage.clear();
    await clear(entriesStore);
    await invalidateAll();
    return;
  }
</script>

<div class="lg:w-[500px] w-[300px] bg-base-300 p-2 rounded-md mb-4">
  <div class="border-b-2 border-neutral pb-2 flex justify-between items-center">
    <h3 class="font-semibold text-xl">
      Diary Already Exists in Browser Storage
    </h3>
  </div>
  <p class="font-medium mt-6">
    The app supports only one diary per browser, and there is currently an
    existing diary in this browser. You can delete the current diary by clicking
    the button below, but please make sure to backup/sync the previous diary
    before doing so.
  </p>
  <div class="inline-flex w-full space-x-2 mt-4">
    <a href="/unlock-diary" class="btn btn-warning grow">Cancel</a>
    <button on:click={deleteCurrentDiary} class="btn-error btn font-bold grow"
      >Delete it!</button
    >
  </div>
</div>

