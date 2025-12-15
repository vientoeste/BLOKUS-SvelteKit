<script lang="ts">
  import { useGame } from "$lib/client/game/context";
  import Block from "./Block.svelte";

  const { presentation } = useGame();
  const blocks = $presentation.block.visibleBlocks;
</script>

<div id="blocks-container">
  <div id="blocks">
    {#each $blocks as block (block.slotIdx + block.blockType)}
      <Block
        blockType={block.blockType}
        slotIdx={block.slotIdx}
        rotation={block.rotation}
        flip={block.flip}
        placeable={block.placeable}
      />
    {/each}
  </div>
</div>

<style>
  #blocks-container {
    width: 100%;
    flex: 1;
    padding: 10px;
    border-radius: 10px;
    background-color: var(--YELLOW);
    min-height: 0;
  }

  #blocks {
    background-color: var(--BACKGROUND);
    gap: 5px;
    padding: 5px;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    min-height: 0;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
  }
</style>
