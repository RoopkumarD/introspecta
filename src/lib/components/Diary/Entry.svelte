<script lang="ts">
  export let id: string, title: string, content: string, timestamp: number;
</script>

<a href={`/diary/${id}`} class="btn text-left w-full p-4 h-min">
  <span class="font-bold w-full line-clamp-1">{title}</span>
  <span class="font-normal w-full line-clamp-2">{content}</span>
  <span class="font-light w-full">{new Date(timestamp).toDateString()}</span>
</a>
