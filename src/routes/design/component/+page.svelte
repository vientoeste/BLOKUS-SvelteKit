<script lang="ts">
  import Cell from "$lib/components/game/Cell.svelte";
  import { blockSizeStore, blockStore, innerHeightStore } from "$lib/store";
  import { colorMapper } from "$lib/utils";
  import { onMount } from "svelte";

  onMount(() => {
    blockStore.initialize([0, 2]);
  });
</script>

<Cell color="BLUE" />

<br />
{$innerHeightStore}
{($innerHeightStore - 21 - $blockSizeStore * 20) / 2}
block: {$innerHeightStore - 21 - Math.floor($innerHeightStore / 20)}
<br />

block: {Math.floor($innerHeightStore / 20)}
board: {Math.floor($innerHeightStore / 20 - 1) * 20 + 21}
<!-- 
<Block51 color={1}></Block51>

<Block54 color={0}></Block54> -->
