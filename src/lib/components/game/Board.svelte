<script lang="ts">
  import { boardStore } from "$lib/store";
  import ColorMatrixRenderer from "./ColorMatrixRenderer.svelte";
</script>

<div id="board">
  <div class="board__row">
    <ColorMatrixRenderer id="board" matrix={$boardStore}></ColorMatrixRenderer>
  </div>
</div>

<style>
  #board {
    display: flex;
    flex-direction: column;
  }
</style>
