<script lang="ts">
  import Home from "$lib/components/Dashboard/Home.svelte";
  import Login from "$lib/components/Login/Login.svelte";
  import { stage } from "$lib/store";
</script>

{#if $stage === "Login"}
  <Login />
{:else if $stage === "Dashboard"}
  <Home />
{/if}
