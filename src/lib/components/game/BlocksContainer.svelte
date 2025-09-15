<script lang="ts">
  import { unusedBlockStore } from "$lib/store";
  import Block from "./Block.svelte";

  let rerenderer = $state(0);
</script>

<div id="blocks-container">
  {#key rerenderer}
    {#each $unusedBlockStore as block (block.slotIdx + block.blockType)}
      <Block
        blockType={block.blockType}
        slotIdx={block.slotIdx}
        rotation={block.rotation}
        flip={block.flip}
        placeable={block.placeable}
      />
    {/each}
  {/key}
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
