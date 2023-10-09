<script lang="ts">
  import DesktopHome from "$lib/components/Dashboard/Desktop/DesktopHome.svelte";
  import Login from "$lib/components/Login/Login.svelte";
  import { stage } from "$lib/store";
  import { API_KEY, DISCOVERY_DOC, revokeAccessToken } from "$lib/googleDrive";
  import { beforeNavigate } from "$app/navigation";

  function gapiLoaded() {
    window.gapi.load("client", initializeGapiClient);
  }

  async function initializeGapiClient() {
    await window.gapi.client.init({
      apiKey: API_KEY,
      discoveryDocs: [DISCOVERY_DOC],
    });
  }

  beforeNavigate(({ type }) => {
    if (type === "leave") {
      revokeAccessToken();
    }
  });
</script>

<svelte:head>
  <title>Introspecta</title>

  <script src="https://apis.google.com/js/api.js" on:load={gapiLoaded}></script>
  <script src="https://accounts.google.com/gsi/client" async></script>
</svelte:head>

<div class="hidden xl:block">
  {#if $stage === "Login"}
    <Login />
  {:else if $stage === "Dashboard"}
    <DesktopHome />
  {/if}
</div>
<div
  class="text-xl font-bold text-center px-4 gap-2 flex flex-col justify-center items-center h-screen xl:hidden"
>
  <p class="">This view is optimised for desktop</p>
  <p class="">
    Please visit <a class="link-primary underline" href="/mobile"
      >Mobile Version</a
    > for using app via phones
  </p>
</div>
