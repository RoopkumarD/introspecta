<script lang="ts">
  import { publicKeyStore, entries } from "$lib/store";
  import { pack } from "msgpackr";
  import { update, set, createStore } from "idb-keyval";
  import toast from "svelte-french-toast";
  import { encryptLog } from "$lib/libsodium";
  import { goto } from "$app/navigation";

  export let isNew: boolean,
    id: string,
    title: string,
    content: string,
    notebook: string;

  const entriesStore = createStore("introspecta", "entries");

  async function saveLog() {
    if ($publicKeyStore === "") {
      toast.error("pubKey is '', internal problem");
      return;
    }

    const timestamp = new Date().getTime();
    const { encrypted } = await encryptLog(
      pack([title, content, timestamp, notebook]),
      $publicKeyStore
    );

    if (isNew === false) {
      try {
        await update(
          id,
          (val) => {
            return {
              ...val,
              entry: encrypted,
              lastSyncTime: null,
            };
          },
          entriesStore
        );
      } catch (err) {
        toast.error("Err while saving entry to indexeddb");
        return;
      }
    } else {
      try {
        await set(
          id,
          { id: id, entry: encrypted, lastSyncTime: null },
          entriesStore
        );
      } catch (err) {
        toast.error("Err while saving entry to indexeddb");
        return;
      }
    }

    $entries[id] = {
      id: id,
      title: title,
      content: content,
      timestamp: timestamp,
      notebook: notebook,
    };
    goto("/diary");
  }
</script>

<div
  class="tooltip tooltip-bottom tooltip-success font-bold hidden xl:block"
  data-tip="Save Entry"
>
  <button on:click={saveLog} class="btn btn-square btn-success">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="lucide lucide-save"
      ><path
        d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"
      /><polyline points="17 21 17 13 7 13 7 21" /><polyline
        points="7 3 7 8 15 8"
      /></svg
    >
  </button>
</div>
<button on:click={saveLog} class="btn btn-sm btn-success xl:hidden"
  >Save Entry</button
>
