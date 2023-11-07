<script>
  import { onMount } from "svelte";
  import { theme } from "$lib/store";

  import "../app.css";

  onMount(() => {
    const dataTheme = document
      .querySelector("html")
      ?.getAttribute("data-theme");

    if (dataTheme !== undefined) {
      if (dataTheme === "business") {
        $theme = false;
      } else if (dataTheme === "cupcake") {
        $theme = true;
      }
    }
  });
</script>

<slot />
