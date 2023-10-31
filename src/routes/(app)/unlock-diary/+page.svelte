<script lang="ts">
  import ThemeChooser from "$lib/components/ThemeChooser.svelte";
  import EnterKey from "$lib/components/Unlock-Create/EnterKey.svelte";
</script>

<nav class="flex justify-between items-center px-4 pt-4 xl:px-8">
  <h1 class="font-abrilFatFace text-xl">
    introspecta<span class="bg-primary ml-2 p-1 rounded-md text-sm">beta</span>
  </h1>
  <ThemeChooser />
</nav>
<EnterKey />
