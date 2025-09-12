<script>
  import Board from "$lib/components/game/Board.svelte";
  import TriplePanelLayout from "$lib/components/TriplePanelLayout.svelte";
</script>

<TriplePanelLayout>
  <Board />

  {#snippet left()}
    <div id="left-container"></div>
  {/snippet}

  {#snippet right()}
    <div id="right-container"></div>
  {/snippet}
</TriplePanelLayout>

<style>
  #left-container,
  #right-container {
    width: 100%;
    height: 100%;
  }
</style>
