<script lang="ts">
  import ThemeChooser from "$lib/components/ThemeChooser.svelte";
  import SettingModal from "$lib/components/Diary/SettingModal.svelte";
  import SettingsButton from "$lib/components/Diary/SettingsButton.svelte";
  import NotebookDropDown from "$lib/components/Diary/NotebookDropDown.svelte";
  import EntriesByNotebook from "./EntriesByNotebook.svelte";

  let showModal = false;
</script>

<SettingModal bind:showModal />

<div class="py-2 px-6">
  <div class="flex justify-between items-center">
    <SettingsButton bind:showModal />
    <ThemeChooser />
  </div>
  <NotebookDropDown />
  <div id="entries" class="h-[calc(100vh-160px)] space-y-2 overflow-y-auto">
    <EntriesByNotebook />
  </div>
</div>
