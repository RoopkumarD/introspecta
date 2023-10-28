<script lang="ts">
  import DeleteEntry from "$lib/components/Mobile/Dashboard/DeleteEntry.svelte";
  import SaveEntry from "$lib/components/Mobile/Dashboard/SaveEntry.svelte";
  import { goto } from "$app/navigation";
  import { beforeNavigate } from "$app/navigation";
  import type { PageData } from "./$types";
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

    goto("/mobile/app");
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
      if (
        (isNew === true && (title !== "" || content !== "")) ||
        (isNew === false && (title !== data.title || content !== data.content))
      ) {
        navigation.cancel();
      }
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

<WarningModal {...wModal} />

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
