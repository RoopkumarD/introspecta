<script lang="ts">
  import ThemeChooser from "$lib/components/ThemeChooser.svelte";
</script>

<div class="navbar bg-base-100 px-5 xl:px-8">
  <div class="navbar-start">
    <a href="/" class="text-lg font-abrilFatFace">introspecta</a>
  </div>
  <div class="flex items-center gap-4 navbar-end">
    <div class="hidden xl:block">
      <ThemeChooser />
    </div>
    <a href="/unlock-diary" class="btn btn-secondary !rounded-none btn-sm"
      >Open Diary</a
    >
  </div>
</div>
