<script lang="ts">
  import { notebookEntries } from "$lib/store";
  import Entry from "./Entry.svelte";
</script>

{#each $notebookEntries as entry (entry.id)}
  <Entry
    id={entry.id}
    title={entry.title}
    content={entry.content}
    timestamp={entry.timestamp}
  />
{/each}
