<script lang="ts">
  import Footer from "$lib/components/Landing/Footer.svelte";
  import Nav from "$lib/components/Landing/Nav.svelte";
</script>

<Nav />
<div class="bg-base-200">
  <main class="prose lg:prose-xl px-6 py-4 lg:py-12 lg:mx-auto">
    <slot />
  </main>
</div>
<Footer />
