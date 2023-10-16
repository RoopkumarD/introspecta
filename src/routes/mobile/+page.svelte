<script lang="ts">
  import Login from "$lib/components/Mobile/Login/Login.svelte";
</script>

<div class="block xl:hidden">
  <Login />
</div>
<div
  class="text-xl font-bold text-center gap-2 flex-col justify-center items-center h-screen
  hidden xl:flex"
>
  <p class="">This view is optimised for mobile</p>
  <p class="">
    Please visit <a class="link-primary underline" href="/desktop"
      >Desktop Version</a
    > for using app via desktops
  </p>
</div>
