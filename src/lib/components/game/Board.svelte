<script lang="ts">
  // [TODO] DnD should be added
  import { boardStore } from "$lib/store";
  import ColorMatrixRenderer from "./ColorMatrixRenderer.svelte";

  let boardElement: HTMLElement;
</script>

<div id="board-cover" bind:this={boardElement}>
  <ColorMatrixRenderer id="board" matrix={$boardStore}></ColorMatrixRenderer>
</div>
