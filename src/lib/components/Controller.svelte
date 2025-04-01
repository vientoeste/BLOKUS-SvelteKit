<script lang="ts">
  import { gameStore } from "$lib/store";
  const { startGame } = $props();
</script>

{#if $gameStore.playerIdx === 0 && $gameStore.turn === -1}
  <button id="start-button" onclick={startGame}> start </button>
{/if}
