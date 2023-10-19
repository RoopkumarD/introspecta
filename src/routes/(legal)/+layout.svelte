<script lang="ts">
  import ThemeChooser from "$lib/components/ThemeChooser.svelte";
</script>

<div class="navbar bg-base-100 flex items-center justify-between px-6">
  <a href="/" class="text-xl font-abrilFatFace hover:underline">introspecta</a>
  <div class="flex items-center gap-3">
    <button class="btn btn-circle btn-ghost !rounded-full">
      <ThemeChooser />
    </button>
    <a href="/desktop" class="btn btn-primary btn-outline hidden xl:inline-flex"
      >Try App</a
    >
    <a href="/mobile" class="btn btn-primary btn-outline xl:hidden">Try App</a>
  </div>
</div>
<div class="bg-base-200">
  <main class="prose lg:prose-xl px-6 py-4 lg:py-12 lg:mx-auto">
    <slot />
  </main>
</div>
<footer class="footer p-10 bg-neutral text-neutral-content">
  <nav>
    <header class="footer-title">General</header>
    <a
      target="_blank"
      class="link link-hover"
      href="https://github.com/RoopkumarD/introspecta">Github Repo</a
    >
    <a
      target="_blank"
      class="link link-hover"
      href="mailto:roopkumards@gmail.com">My Email</a
    >
    <a
      target="_blank"
      class="link link-hover"
      href="https://twitter.com/Roopkd_">Twitter</a
    >
  </nav>
  <nav>
    <header class="footer-title">Legal</header>
    <a target="_blank" class="link link-hover" href="/privacy-policy"
      >Privacy policy</a
    >
    <a target="_blank" class="link link-hover" href="/cookie-policy"
      >Cookie policy</a
    >
  </nav>
</footer>
