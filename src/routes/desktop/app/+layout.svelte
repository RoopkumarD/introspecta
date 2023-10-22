<script lang="ts">
  import SideBar from "$lib/components/Desktop/Dashboard/SideBar.svelte";
  import { desktopDrawer } from "$lib/store";
</script>

<div
  id="sidebar"
  class={`fixed bg-base-300 font-inter overflow-x-hidden ${
    $desktopDrawer ? "w-72" : "w-0"
  } h-full transition-all duration-200`}
>
  <SideBar />
</div>
<div
  class={`${
    $desktopDrawer ? "ml-72" : ""
  } font-inter duration-200 transition-all`}
>
  <slot />
</div>
