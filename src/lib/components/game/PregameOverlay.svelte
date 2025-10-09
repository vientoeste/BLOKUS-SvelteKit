<script lang="ts">
  import { blockSizeStore } from "$lib/store";
</script>

<div
  class="pregame-overlay-container"
  style:width="{($blockSizeStore + 3) * 20 + 1}px"
>
  <!-- [TODO] add ready/unready buttons and start button here -->
</div>

<style>
  .pregame-overlay-container {
    position: absolute;
    aspect-ratio: 1;
    top: 0;
  }
</style>
