<script lang="ts">
  import { Toaster } from "svelte-french-toast";
  import DeleteEntry from "$lib/components/Mobile/Dashboard/DeleteEntry.svelte";
  import SaveEntry from "$lib/components/Mobile/Dashboard/SaveEntry.svelte";
  import { goto } from "$app/navigation";
  import { beforeNavigate } from "$app/navigation";
  import type { PageData } from "../$types";

  export let data: PageData;

  let id: string = data.id;
  let title: string = data.title;
  let content: string = data.content;
  let notebook: string = data.notebook;
  let isNew: boolean = data.isNew;

  function goToHome(permissionGiven: boolean) {
    if (isNew === true) {
      if (permissionGiven === false && (title !== "" || content !== "")) {
        dialog.showModal();
        return;
      }
    } else if (isNew === false) {
      if (
        permissionGiven === false &&
        (title !== data.title || content !== data.content)
      ) {
        dialog.showModal();
        return;
      }
    }

    goto("/mobile/app");
  }

  let dialog: HTMLDialogElement;

  beforeNavigate((navigation) => {
    if (navigation.type === "popstate") {
      if (
        (isNew === true && (title !== "" || content !== "")) ||
        (isNew === false && (title !== data.title || content !== data.content))
      ) {
        navigation.cancel();
        dialog.showModal();
      }
    } else if (navigation.type === "leave") {
      navigation.cancel();
    }
  });
</script>

<Toaster />

<dialog class="modal" bind:this={dialog}>
  <div class="modal-box leading-2">
    <div
      class="border-b-2 border-neutral pb-2 flex justify-between items-center"
    >
      <h3 class="font-semibold text-xl">Go Back</h3>
      <button on:click={() => dialog.close()} class="btn btn-warning btn-sm"
        >cancel</button
      >
    </div>
    <p class="font-medium mt-6">
      Are you sure you want to go back home, cuz you haven't saved changes
    </p>
    <p class="text-error text-sm mt-1">
      *Note that this action is irreversible. You won't be able to recover this
      entry later
    </p>
    <button
      on:click={() => {
        goToHome(true);
      }}
      class="btn-error btn grow w-full font-bold mt-6">Go Back Home!</button
    >
  </div>
</dialog>

<nav
  class="flex justify-between items-center border-b-[1px] border-base-300 py-3 px-4"
>
  <button
    on:click={() => {
      goToHome(false);
    }}
    class="btn btn-sm"
  >
    Home
  </button>

  <div class="flex items-center gap-4">
    <DeleteEntry bind:id bind:isNew bind:title bind:content bind:notebook />
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
