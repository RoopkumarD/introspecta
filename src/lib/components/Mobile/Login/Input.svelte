<script lang="ts">
  export let value: string, index: number, disabled: boolean;
</script>

<div class="relative">
  <span class="absolute left-4 top-2 text-md md:text-xl">{index}.</span>
  <input
    class="pl-9 py-2 bg-transparent text-md md:text-xl border-[1px] border-base-300 rounded-lg w-full lg:w-56"
    bind:value
    type="text"
    placeholder="pass..."
    {disabled}
  />
</div>
