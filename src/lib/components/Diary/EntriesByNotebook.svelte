<script lang="ts">
  import { notebookEntries } from "$lib/store";
  import Entry from "./Entry.svelte";
</script>

{#if $notebookEntries.length !== 0}
  {#each $notebookEntries as entry (entry.id)}
    <Entry
      id={entry.id}
      title={entry.title}
      content={entry.content}
      timestamp={entry.timestamp}
    />
  {/each}
{:else}
  <p class="px-4 pt-10 text-center flex justify-center items-center">
    No logs found, create a new one
  </p>
{/if}
