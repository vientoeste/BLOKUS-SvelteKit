<script lang="ts">
  import { filteredBlockStore } from "$lib/store";
  import Block from "./Block.svelte";
</script>

<div id="blocks-container">
  <div id="blocks">
    {#each $filteredBlockStore as block (block.slotIdx + block.blockType)}
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
    width: 300px;
    min-width: 296px;
    height: 100%;
    overflow-y: scroll;
    gap: 5px;
    display: flex;
    flex-wrap: wrap;
  }
</style>
