<script>
  import Board from "$lib/components/game/Board.svelte";
  import TriplePanelLayout from "$lib/components/TriplePanelLayout.svelte";
</script>

<TriplePanelLayout>
  <Board />

  {#snippet left()}
    <div id="left-container">
      <div id="participant-container">
        <!-- [TODO] add participants component -->
      </div>
      <div id="tmp-container">
        <!-- [TODO] add component -->
      </div>
    </div>
  {/snippet}

  {#snippet right()}
    <div id="right-container">
      <div id="blocks-container">
        <!-- [TODO] add BlocksContainer component -->
      </div>
    </div>
  {/snippet}
</TriplePanelLayout>

<style>
  #right-container {
    width: 100%;
    height: 100%;
    min-width: calc(var(--block-size) * 5 + 4px);
  }

  #left-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    min-width: calc(var(--block-size) * 5 + 4px);
  }
</style>
