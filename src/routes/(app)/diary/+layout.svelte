<script lang="ts">
  import SideBar from "$lib/components/Diary/SideBar.svelte";
  import { desktopDrawer } from "$lib/store";
</script>

<div
  id="sidebar"
  class={`fixed bg-base-300 font-inter overflow-x-hidden w-0 ${
    $desktopDrawer ? "xl:w-72" : "xl:w-0"
  } h-full transition-all duration-200`}
>
  <SideBar />
</div>
<div
  class={`${
    $desktopDrawer ? "xl:ml-72" : ""
  } font-inter duration-200 transition-all`}
>
  <slot />
</div>
