<script lang="ts">
  import ThemeChooser from "$lib/components/ThemeChooser.svelte";
  import SettingModal from "$lib/components/Diary/SettingModal.svelte";
  import SettingsButton from "$lib/components/Diary/SettingsButton.svelte";
  import EntriesByNotebook from "./EntriesByNotebook.svelte";
  import { currentNotebook } from "$lib/store";
  import NotebookModal from "./NotebookModal.svelte";

  let showModal = false;
  let notebookModal = false;
</script>

<SettingModal bind:showModal />
<NotebookModal bind:showModal={notebookModal} />

<div class="py-2 px-6">
  <div class="flex justify-between items-center">
    <SettingsButton bind:showModal />
    <ThemeChooser />
  </div>
  <button
    on:click={() => (notebookModal = true)}
    class="btn btn-neutral w-full flex justify-between my-4"
    ><span>{$currentNotebook}</span><svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="lucide lucide-plus"><path d="M5 12h14" /><path d="M12 5v14" /></svg
    ></button
  >
  <div id="entries" class="h-[calc(100vh-160px)] space-y-2 overflow-y-auto">
    <EntriesByNotebook />
  </div>
</div>
