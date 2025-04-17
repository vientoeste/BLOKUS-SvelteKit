<script lang="ts">
  import {
    gameStore,
    moveStore,
    userStore,
    blockStore,
    dragPositionOffsetStore,
    movePreviewStore,
  } from "$lib/store";
</script>

<div id="game-store-monitor" class="monitor">
  <div>
    turn: {$gameStore.turn}
  </div>
  <div>
    playerIdx: {$gameStore.playerIdx}
  </div>
  <div>
    players: {$gameStore.players}
  </div>
  <div>
    isStarted: {$gameStore.isStarted}
  </div>
  <div>
    mySlots: {$gameStore.mySlots}
  </div>
</div>

<div id="move-store-monitor" class="monitor">
  <div>
    type: {$moveStore?.type}
  </div>
  <div>
    rotation: {$moveStore?.rotation}
  </div>
  <div>
    flip: {$moveStore?.flip}
  </div>
  <div>
    slotIdx: {$moveStore?.slotIdx}
  </div>
</div>

<div id="user-store-monitor" class="monitor">
  <div>
    id: {$userStore.id}
  </div>
  <div>
    userId: {$userStore.userId}
  </div>
  <div>
    username: {$userStore.username}
  </div>
</div>

<div id="block-store-monitor" class="monitor">
  {#each $blockStore as block}
    <div>
      type: {block.blockType},<br />
      flip: {block.flip},<br />
      isPlaced: {block.isPlaced},<br />
      placeable: {block.placeable},<br />
      rotation: {block.rotation},<br />
      slotIdx: {block.slotIdx}
    </div>
  {/each}
</div>

<div id="drag-position-offset-store-monitor" class="monitor">
  drag position offset:
  {#each $dragPositionOffsetStore as pos, idx}
    {pos}{#if idx === 0}:{/if}
  {/each}
</div>

<div id="move-store-monitor" class="monitor">
  <div>
    type: {$moveStore?.type}
  </div>
  <div>
    slot: {$moveStore?.slotIdx}
  </div>
  <div>
    rot: {$moveStore?.rotation}
  </div>
  <div>
    flip: {$moveStore?.flip}
  </div>
</div>

<style>
  .monitor {
    display: flex;
    flex-direction: row;
    max-width: 100%;
    overflow-x: auto;
    white-space: nowrap;
  }
  .monitor > div {
    margin: 2px;
  }
</style>
