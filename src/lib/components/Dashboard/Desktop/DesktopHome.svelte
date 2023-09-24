<script lang="ts">
  import DesktopNav from "./DesktopNav.svelte";
  import CreateLog from "./CreateLog.svelte";
  import SideBar from "./SideBar.svelte";
  import Editor from "./Editor.svelte";
  import { blog } from "$lib/store";

  let drawerOpen = false;
</script>

<div
  id="sidebar"
  class={`fixed bg-base-300 font-inter overflow-x-hidden ${
    drawerOpen ? "w-72" : "w-0"
  } h-full transition-all duration-200`}
>
  <SideBar />
</div>
<div
  class={`${drawerOpen ? "ml-72" : ""} font-inter duration-200 transition-all`}
>
  <DesktopNav bind:drawerOpen />
  {#if $blog.writeBlog === false}
    <CreateLog />
  {:else}
    <Editor />
  {/if}
</div>
