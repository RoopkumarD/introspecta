<script lang="ts">
  export let id: string, title: string, content: string, timestamp: number;
</script>

<div id="card" class="p-2 space-y-1 bg-base-100 hover:bg-base-200 rounded-md">
  <p class="font-semibold text-md">{title}</p>
  <p class="line-clamp-2 text-sm">{content}</p>
  <p class="font-light text-xs">{new Date(timestamp).toDateString()}</p>
</div>
