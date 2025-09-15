<script lang="ts">
  // [TODO] DnD should be added
  import { getBlockMatrix } from "$lib/game/core";
  import ColorMatrixRenderer from "./ColorMatrixRenderer.svelte";

  const { blockType, slotIdx, rotation, flip, placeable } = $props();

  const blockMatrix = getBlockMatrix({
    type: blockType,
    flip,
    rotation,
  }).map((row) =>
    row.map((cell) => {
      if (cell) {
        return slotIdx;
      }
      return -1;
    }),
  );
</script>

<div class="block">
  <ColorMatrixRenderer id={`block-${blockType}`} matrix={blockMatrix}
  ></ColorMatrixRenderer>
</div>
