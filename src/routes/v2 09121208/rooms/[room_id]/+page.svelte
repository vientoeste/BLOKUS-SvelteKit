<script module>
  export { left, right };
</script>

<script>
  import { BoardStateManager } from "$lib/client/game/state";
  import Board from "$lib/components/game/Board.svelte";
  import { blockStore } from "$lib/store";
  import { onMount } from "svelte";

  onMount(() => {
    new BoardStateManager().initializeBoard();
    blockStore.initialize([0, 2]);
  });
</script>

<Board />

{#snippet left()}
  <div id="left">fadsfdsafdsa</div>
{/snippet}

{#snippet right()}
  <div id="right">rsdg</div>
{/snippet}

<style>
  #left,
  #right {
    width: 100%;
    height: 100%;
    min-width: calc(var(--block-size) * 5 + 4px);
    background-color: aqua;
  }
</style>
