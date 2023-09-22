<script lang="ts">
  import DesktopHome from "./Desktop/DesktopHome.svelte";
  import MobileHome from "./Mobile/MobileHome.svelte";
</script>

<div class="hidden xl:block">
  <DesktopHome />
</div>
<div class="block xl:hidden">
  <MobileHome />
</div>
