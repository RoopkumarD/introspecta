<script lang="ts">
  import { Toaster } from "svelte-french-toast";
  import DeleteEntry from "$lib/components/Mobile/Dashboard/DeleteEntry.svelte";
  import SaveEntry from "$lib/components/Mobile/Dashboard/SaveEntry.svelte";
  import { goto } from "$app/navigation";
  import type { PageData } from "../$types";

  export let data: PageData;

  let id: string = data.id;
  let title: string = data.title;
  let content: string = data.content;
  let notebook: string = data.notebook;
  let isNew: boolean = data.isNew;

  function goToHome() {
    goto("/mobile/app");
  }
</script>

<Toaster />

<nav
  class="flex justify-between items-center border-b-[1px] border-base-300 py-3 px-4"
>
  <button on:click={goToHome} class="btn btn-sm"> Home </button>

  <div class="flex items-center gap-4">
    <DeleteEntry bind:id bind:isNew />
    <SaveEntry bind:isNew bind:id bind:title bind:content bind:notebook />
  </div>
</nav>
<main class="h-[calc(100vh-66px)] flex flex-col px-4 pt-3">
  <input
    bind:value={title}
    name="title"
    placeholder="title here..."
    class="textarea !outline-0 w-full rounded-none text-2xl overflow-hidden text-ellipsis font-bold"
    autocomplete="off"
  />
  <textarea
    bind:value={content}
    name="content"
    placeholder="content here..."
    class="textarea resize-none !outline-0 w-full rounded-none text-lg grow"
  />
</main>
