<script lang="ts">
  import DeleteEntry from "$lib/components/Diary/DeleteEntry.svelte";
  import SaveEntry from "$lib/components/Diary/SaveEntry.svelte";
  import { goto } from "$app/navigation";
  import { desktopDrawer } from "$lib/store";
  import { beforeNavigate } from "$app/navigation";
  import type { PageData } from "./$types";
  import { openWarningModal } from "$lib/warningStore";

  export let data: PageData;

  let id: string = data.id;
  let title: string = data.title;
  let content: string = data.content;
  let notebook: string = data.notebook;
  let isNew: boolean = data.isNew;

  const wModal = {
    title: "Go Back",
    content:
      "Are you sure you want to go back home, cuz you haven't saved changes",
    buttonString: "Go Back Home!",
    action: goToHome,
  };

  function goToHome(permissionGiven: boolean) {
    if (isNew === true) {
      if (permissionGiven === false && (title !== "" || content !== "")) {
        openWarningModal(wModal);
        return;
      }
    } else if (isNew === false) {
      if (
        permissionGiven === false &&
        (title !== data.title || content !== data.content)
      ) {
        openWarningModal(wModal);
        return;
      }
    }

    goto("/diary");
  }

  beforeNavigate((navigation) => {
    if (
      (isNew === true && (title !== "" || content !== "")) ||
      (isNew === false && (title !== data.title || content !== data.content))
    ) {
      if (navigation.type === "popstate") {
        navigation.cancel();
        openWarningModal(wModal);
      } else if (navigation.type === "leave") {
        navigation.cancel();
      } else if (
        navigation.type === "link" &&
        navigation.from?.route.id === "/(app)/diary/[id]"
      ) {
        if (navigation.from.route.id !== data.id) {
          navigation.cancel();
          openWarningModal(wModal);
        }
      }
    }
  });
</script>

<nav
  class="flex items-center justify-between border-b-[1px] border-base-300 py-3 xl:py-2 px-4"
>
  <button
    id="menu"
    on:click={() => ($desktopDrawer = !$desktopDrawer)}
    class="btn btn-ghost btn-square ml-4 hidden xl:flex"
  >
    {#if $desktopDrawer === true}
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
        class="lucide lucide-panel-right-open"
        ><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><line
          x1="15"
          x2="15"
          y1="3"
          y2="21"
        /><path d="m10 15-3-3 3-3" /></svg
      >
    {:else}
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
        class="lucide lucide-panel-left-open"
        ><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><path
          d="M9 3v18"
        /><path d="m14 9 3 3-3 3" /></svg
      >
    {/if}
  </button>

  <button
    on:click={() => {
      goToHome(false);
    }}
    class="btn btn-sm xl:hidden"
  >
    Home
  </button>

  <div id="operations" class="flex items-center gap-4 xl:mr-4">
    <div
      class="tooltip tooltip-bottom font-bold hidden xl:block"
      data-tip="Go Back Home"
    >
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
