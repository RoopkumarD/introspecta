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
<div class="hero min-h-screen bg-base-200">
  <div class="hero-content text-center">
    <div class="max-w-md">
      <h1 class="text-5xl font-abrilFatFace">An Online Diary</h1>
      <p class="py-6 font-inter">
        which heavily focuses on privacy. All of your diary entries is contained
        within your browser storage and your <img
          src="/driveLogo.png"
          alt="google-drive-icon"
          class="h-4 w-4 inline"
        /> Google Drive storage is used to backup/sync
      </p>
      <a href="/desktop" class="btn btn-primary hidden xl:inline-flex"
        >Get Started</a
      >
      <a href="/mobile" class="btn btn-primary xl:hidden">Get Started</a>
    </div>
  </div>
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
