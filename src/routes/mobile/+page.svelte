<script lang="ts">
  import MobileHome from "$lib/components/Dashboard/Mobile/MobileHome.svelte";
  import Login from "$lib/components/Login/Login.svelte";
  import { stage } from "$lib/store";
  import { API_KEY, DISCOVERY_DOC, CLIENT_ID } from "$lib/googleDrive";
  import { sodiumReady } from "$lib/libsodium";
  import { onMount } from "svelte";

  function gapiLoaded() {
    window.gapi.load("client", initializeGapiClient);
  }

  async function initializeGapiClient() {
    await window.gapi.client.init({
      apiKey: API_KEY,
      discoveryDocs: [DISCOVERY_DOC],
    });
  }

  onMount(() => {
    sodiumReady();
  });
</script>

<svelte:head>
  <title>Introspecta</title>

  <script src="https://apis.google.com/js/api.js" on:load={gapiLoaded}></script>
  <script src="https://accounts.google.com/gsi/client" async></script>

  <meta name="google-signin-client_id" content={CLIENT_ID} />
</svelte:head>

<div class="block xl:hidden">
  {#if $stage === "Login"}
    <Login />
  {:else if $stage === "Dashboard"}
    <MobileHome />
  {/if}
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
