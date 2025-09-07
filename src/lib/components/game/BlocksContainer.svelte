<script lang="ts">
  import { innerHeightStore, unusedBlockStore } from "$lib/store";
</script>

<div id="blocks-container">
  {#each $unusedBlockStore as block (block.slotIdx + block.blockType)}
    <!-- block -->
  {/each}
</div>

<style>
  #blocks-container {
    min-width: 296px;
    background-color: aliceblue;
    height: 100%;
  }
</style>
