<script lang="ts">
  import { goto } from "$app/navigation";
  import { blog } from "$lib/store";
  import { journalling } from "$lib/store";
  export let id: string,
    index: number,
    title: string,
    content: string,
    journal: string,
    timestamp: number;

  function choosedEntry() {
    $blog.id = id;
    $blog.title = title;
    $blog.content = content;
    $blog.journal = journal;

    $journalling.updateIndex = index;

    $blog.writeBlog = true;
    goto(`/mobile/app/${id}`);
  }
</script>

<button on:click={choosedEntry} class="btn text-left w-full p-4 h-min">
  <span class="font-bold w-full line-clamp-1">{title}</span>
  <span class="font-normal w-full line-clamp-2">{content}</span>
  <span class="font-light w-full">{new Date(timestamp).toDateString()}</span>
</button>
