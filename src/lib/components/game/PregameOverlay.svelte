<script lang="ts">
  import { useGame } from "$lib/client/game/context";
  import { blockSizeStore } from "$lib/store";

  let {
    startGame,
    ready,
    unready,
  }: {
    startGame: undefined | (() => void);
    ready: () => void;
    unready: () => void;
  } = $props();

  const { state } = useGame();
  const gamePhaseStore = $state?.progress.phase;
</script>

{#if $gamePhaseStore === "NOT_STARTED" || $gamePhaseStore === undefined}
  <div
    class="pregame-overlay-container"
    style:width="{($blockSizeStore + 3) * 20 + 1}px"
  >
    <div id="start-game-button-container">
      {#if startGame !== undefined}
        <button onclick={startGame}>start</button>
      {/if}
    </div>
    <div id="ready-button-container">
      <button onclick={ready}>ready</button>
    </div>
    <div id="unready-button-container">
      <button onclick={unready}>cancel</button>
    </div>
  </div>
{/if}

<style>
  .pregame-overlay-container {
    position: absolute;
    aspect-ratio: 1;
    top: 0;
  }
</style>
