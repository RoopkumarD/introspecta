<script>
  import DeleteEntry from "$lib/components/Dashboard/Mobile/DeleteEntry.svelte";
  import SaveEntry from "$lib/components/Dashboard/Mobile/SaveEntry.svelte";
  import { blog, journalling } from "$lib/store";

  function goToHome() {
    $blog.id = "";
    $blog.title = "";
    $blog.content = "";
    $journalling.updateIndex = -1;

    $blog.writeBlog = false;
  }
</script>

<nav
  class="flex justify-between items-center border-b-[1px] border-base-300 py-3 px-4"
>
  <button on:click={goToHome} class="btn btn-sm"> Home </button>

  <div class="flex items-center gap-4">
    <DeleteEntry />
    <SaveEntry />
  </div>
</nav>
<main class="h-[calc(100vh-66px)] flex flex-col px-4 pt-3">
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
