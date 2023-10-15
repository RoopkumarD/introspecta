<script lang="ts">
  import { journalling, blog } from "$lib/store";
  import { pack } from "msgpackr";
  import { update, set, createStore } from "idb-keyval";
  import toast from "svelte-french-toast";
  import { encryptLog } from "$lib/libsodium";

  const entriesStore = createStore("introspecta", "entries");

  async function saveLog() {
    if ($journalling.usedIds === undefined) {
      toast.error("UsedIds set is undefined, contact me");
      return;
    }

    const timestamp = new Date().getTime();

    if ($journalling.updateIndex !== -1) {
      const { encrypted } = await encryptLog(
        pack([$blog.title, $blog.content, timestamp, $blog.journal]),
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
        pack([$blog.title, $blog.content, timestamp, $blog.journal]),
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

      $journalling.usedIds.add($blog.id);

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

<button on:click={saveLog} class="btn btn-sm btn-success">Save Entry</button>
