<script lang="ts">
  // [TODO] DnD should be added
  import { boardStore } from "$lib/store";
  import ColorMatrixRenderer from "./ColorMatrixRenderer.svelte";
</script>

<div id="board-cover">
  <ColorMatrixRenderer id="board" matrix={$boardStore}></ColorMatrixRenderer>
</div>
