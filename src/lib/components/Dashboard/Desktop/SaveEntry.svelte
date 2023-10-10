<script lang="ts">
  import { journalling, blog } from "$lib/store";
  import { pack } from "msgpackr";
  import { update, set, createStore } from "idb-keyval";
  import toast from "svelte-french-toast";

  export let encryptLog: (
    entry: Uint8Array,
    pubKey: string
  ) => Promise<{ encrypted: string }>;

  const entriesStore = createStore("introspecta", "entries");

  async function saveLog() {
    const timestamp = new Date().getTime();

    if ($journalling.updateIndex !== -1) {
      const { encrypted } = await encryptLog(
        pack({
          title: $blog.title,
          content: $blog.content,
          timestamp: timestamp,
          journal: $blog.journal,
        }),
        $journalling.pubKey
      );

      try {
        await update(
          $blog.id,
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

      // updating ui
      $journalling.entries[$blog.journal].splice($journalling.updateIndex, 1);
      $journalling.entries[$blog.journal] = [
        {
          id: $blog.id,
          log: {
            title: $blog.title,
            content: $blog.content,
            timestamp: timestamp,
            journal: $blog.journal,
          },
        },
        ...$journalling.entries[$blog.journal],
      ];

      $journalling.updateIndex = -1;
    } else {
      const { encrypted } = await encryptLog(
        pack({
          title: $blog.title,
          content: $blog.content,
          timestamp: timestamp,
          journal: $journalling.currentJournal,
        }),
        $journalling.pubKey
      );

      try {
        await set(
          $blog.id,
          { id: $blog.id, entry: encrypted, lastSyncTime: null },
          entriesStore
        );
      } catch (err) {
        toast.error("Err while saving entry to indexeddb");
        return;
      }

      // updating ui
      $journalling.entries[$blog.journal] = [
        {
          id: $blog.id,
          log: {
            title: $blog.title,
            content: $blog.content,
            timestamp: timestamp,
            journal: $blog.journal,
          },
        },
        ...$journalling.entries[$blog.journal],
      ];
    }

    // going to back to home
    $blog.id = "";
    $blog.title = "";
    $blog.content = "";

    $blog.writeBlog = false;
  }
</script>

<div
  class="tooltip tooltip-bottom tooltip-success font-bold"
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
