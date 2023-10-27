<script lang="ts">
  import { Toaster } from "svelte-french-toast";
  import DeleteEntry from "$lib/components/Desktop/Dashboard/DeleteEntry.svelte";
  import SaveEntry from "$lib/components/Desktop/Dashboard/SaveEntry.svelte";
  import { goto } from "$app/navigation";
  import { desktopDrawer } from "$lib/store";
  import { beforeNavigate } from "$app/navigation";
  import type { PageData } from "../$types";
  import WarningModal from "$lib/components/WarningModal.svelte";

  export let data: PageData;

  let id: string = data.id;
  let title: string = data.title;
  let content: string = data.content;
  let notebook: string = data.notebook;
  let isNew: boolean = data.isNew;

  function goToHome(permissionGiven: boolean) {
    if (isNew === true) {
      if (permissionGiven === false && (title !== "" || content !== "")) {
        wModal.showModal = true;
        return;
      }
    } else if (isNew === false) {
      if (
        permissionGiven === false &&
        (title !== data.title || content !== data.content)
      ) {
        wModal.showModal = true;
        return;
      }
    }

    goto("/desktop/app");
  }

  beforeNavigate((navigation) => {
    if (navigation.type === "popstate") {
      if (
        (isNew === true && (title !== "" || content !== "")) ||
        (isNew === false && (title !== data.title || content !== data.content))
      ) {
        navigation.cancel();
        wModal.showModal = true;
      }
    } else if (navigation.type === "leave") {
      navigation.cancel();
    }
  });

  let wModal = {
    showModal: false,
    warningTitle: "Go Back",
    warningString:
      "Are you sure you want to go back home, cuz you haven't saved changes",
    warningButtonString: "Go Back Home!",
    warningAction: goToHome,
    createDiaryWarning: false,
  };
</script>

<Toaster />

<WarningModal {...wModal} />

<nav
  class="flex items-center justify-between border-b-[1px] border-base-300 pb-2 pt-2 px-4"
>
  <button
    id="menu"
    on:click={() => ($desktopDrawer = !$desktopDrawer)}
    class="btn btn-square btn-ghost ml-4"
  >
    Menu
  </button>

  <div id="operations" class="flex items-center gap-4 mr-4">
    <div class="tooltip tooltip-bottom font-bold" data-tip="Go Back Home">
      <button
        on:click={() => {
          goToHome(false);
        }}
        class="btn btn-square"
      >
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
          class="lucide lucide-home"
          ><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline
            points="9 22 9 12 15 12 15 22"
          /></svg
        >
      </button>
    </div>
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
