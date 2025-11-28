<script lang="ts">
  import type { ParticipantInf } from "$types";
  import { userStore } from "$lib/store";
  import { useGame } from "$lib/client/game/context";

  let {
    ready,
    unready,
  }: {
    ready: () => void;
    unready: () => void;
  } = $props();

  const { state } = useGame();
  const participantStore = $state?.player.players;
</script>

{#snippet player(playerInfo: ParticipantInf | undefined)}
  <div class="player-container">
    {#if playerInfo === undefined}
      <div></div>
    {:else}
      <div
        class="column-layout {playerInfo.ready ? 'ready' : 'not-ready'}"
        data-user-id={playerInfo.id}
      >
        <div>
          {playerInfo.username}
        </div>
      </div>
    {/if}
    {#if $userStore.id === playerInfo?.id}
      <button onclick={ready}> ready </button>
      <button onclick={unready}> unready </button>
    {/if}
  </div>
{/snippet}

<div id="players-container" class="row-layout">
  {#each $participantStore as playerInfo}
    {@render player(playerInfo)}
  {/each}
</div>

<style>
  .ready {
    border: solid #000000 2px;
  }
  .not-ready {
    border: solid #aa33ff 2px;
  }
</style>
