<script lang="ts">
  import { BoardStateManager } from "$lib/client/game/state";
  import BlocksContainer from "$lib/components/game/BlocksContainer.svelte";
  import Board from "$lib/components/game/Board.svelte";
  import Participants from "$lib/components/game/Participants.svelte";
  import TriplePanelLayout from "$lib/components/TriplePanelLayout.svelte";

  let boardElement: HTMLElement;
</script>

<TriplePanelLayout>
  <div bind:this={boardElement}>
    <Board />
  </div>

  {#snippet left()}
    <div id="left-container">
      <div id="participant-container">
        <Participants />
      </div>
      <div id="tmp-container">
        <!-- [TODO] add component -->
      </div>
    </div>
  {/snippet}

  {#snippet right()}
    <div id="right-container">
      <div id="blocks-container">
        <BlocksContainer />
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
