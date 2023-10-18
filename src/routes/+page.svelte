<script lang="ts">
  import { onMount } from "svelte";

  let themeSelected: boolean;

  function updateTheme() {
    const one_year = 60 * 60 * 24 * 365;

    if (themeSelected === false) {
      localStorage.setItem("theme", "cupcake");
      document.cookie = `theme=cupcake; max-age=${one_year}; path=/; SameSite=Lax`;
      document.documentElement.setAttribute("data-theme", "cupcake");
    } else if (themeSelected === true) {
      localStorage.setItem("theme", "business");
      document.cookie = `theme=business; max-age=${one_year}; path=/; SameSite=Lax`;
      document.documentElement.setAttribute("data-theme", "business");
    }
  }

  onMount(() => {
    const theme = localStorage.getItem("theme");

    if (theme === null) {
      themeSelected = true;
      localStorage.setItem("theme", "cupcake");
      const one_year = 60 * 60 * 24 * 365;
      document.cookie = `theme=cupcake; max-age=${one_year}; path=/; SameSite=Lax`;
    } else {
      if (theme === "cupcake") {
        themeSelected = true;
      } else if (theme === "business") {
        themeSelected = false;
      }
    }
  });
</script>

<div class="navbar bg-base-100 flex items-center justify-between px-6">
  <a href="/" class="text-xl font-abrilFatFace hover:underline">introspecta</a>
  <div class="flex items-center gap-3">
    <button class="btn btn-circle btn-ghost !rounded-full">
      <label class="swap swap-rotate">
        <!-- this hidden checkbox controls the state -->
        <input
          type="checkbox"
          on:change={updateTheme}
          bind:checked={themeSelected}
        />

        <!-- sun icon -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-sun swap-on w-8 h-8"
          ><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path
            d="M12 20v2"
          /><path d="m4.93 4.93 1.41 1.41" /><path
            d="m17.66 17.66 1.41 1.41"
          /><path d="M2 12h2" /><path d="M20 12h2" /><path
            d="m6.34 17.66-1.41 1.41"
          /><path d="m19.07 4.93-1.41 1.41" /></svg
        >

        <!-- moon icon -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-moon swap-off h-8 w-8"
          ><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg
        >
      </label>
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
