<script lang="ts">
  import { getBlockMatrix } from "$lib/game/core";
  import {
    blockSizeStore,
    dragPositionOffsetStore,
    modalStore,
    moveStore,
  } from "$lib/store";
  import type { RawColor } from "$types/client/ui";
  import Alert from "../Alert.svelte";
  import ColorMatrixRenderer from "./ColorMatrixRenderer.svelte";

  const { blockType, slotIdx, rotation, flip, placeable } = $props();

  const blockMatrix: RawColor[][] = getBlockMatrix({
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

  const handleDragStart = (event: DragEvent) => {
    if (!placeable) {
      modalStore.open(Alert, {
        title: "chosen block is not available",
        content: "please try other block",
      });
      event.stopPropagation();
      return;
    }
    if (!event.dataTransfer) {
      console.error(
        "Uncaught exception: handleDragStart's event.dataTransfer is null",
      );
      event.stopPropagation();
      return;
    }

    $moveStore = {
      type: blockType,
      flip,
      rotation,
      slotIdx,
      matrix: blockMatrix,
    };

    event.dataTransfer.effectAllowed = "move";

    const element = event.target as HTMLElement;
    element.style.opacity = "0.4";

    const blockElement = event.target;
    if (blockElement === null) {
      // [TODO] I've never reached this line, but debug will be needed when this line executed during actual game
      console.error("blockelement is null");
      return;
    }
    const blockRect = (blockElement as HTMLElement).getBoundingClientRect();

    dragPositionOffsetStore.set([
      blockRect.left + Math.round($blockSizeStore / 2) - event.clientX,
      blockRect.top + Math.round($blockSizeStore / 2) - event.clientY,
    ]);
  };

  function handleDragEnd(event: DragEvent) {
    const element = event.target as HTMLElement;
    element.style.opacity = "1";
    // [TODO] clear highlightedCells
  }
</script>

<div
  class="block"
  ondragstart={handleDragStart}
  ondragend={handleDragEnd}
  draggable="true"
  aria-label="block {blockType}"
  role="grid"
  tabindex="0"
>
  <ColorMatrixRenderer id={`block-${blockType}`} matrix={blockMatrix}
  ></ColorMatrixRenderer>
</div>
