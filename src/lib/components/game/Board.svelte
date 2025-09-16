<script lang="ts">
  // [TODO] DnD should be added
  import { boardStore } from "$lib/store";
  import ColorMatrixRenderer from "./ColorMatrixRenderer.svelte";

  let boardElement: HTMLElement;
</script>

<div
  id="board-cover"
  bind:this={boardElement}
  role="grid"
  tabindex="0"
  aria-label="Game Board of Blokus"
>
  <ColorMatrixRenderer id="board" matrix={$boardStore}></ColorMatrixRenderer>
</div>
