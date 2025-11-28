<script lang="ts">
  import { useGame } from "$lib/client/game/context";

  const { startGame } = $props();
  const { state } = useGame();
  const turnStore = $state?.progress.turn;
  const playerIdxStore = $state?.player.clientPlayerIdx;
</script>

{#if $playerIdxStore === 0 && $turnStore === -1}
  <button id="start-button" onclick={startGame}> start </button>
{/if}
