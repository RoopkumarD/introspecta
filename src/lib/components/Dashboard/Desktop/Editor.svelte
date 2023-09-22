<script lang="ts">
  import { blog } from "$lib/store";
</script>

<main class="h-[calc(100vh-80px)] flex flex-col px-4">
  <input
    bind:value={$blog.title}
    name="title"
    placeholder="title here..."
    class="textarea !outline-0 w-full rounded-none text-2xl overflow-hidden text-ellipsis font-bold"
    autocomplete="off"
  />
  <textarea
    bind:value={$blog.content}
    name="content"
    placeholder="content here..."
    class="textarea resize-none !outline-0 w-full rounded-none text-lg grow"
  />
</main>
