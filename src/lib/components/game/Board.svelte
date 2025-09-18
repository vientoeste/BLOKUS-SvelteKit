<script lang="ts">
  // [TODO] DnD should be added
  import {
    blockSizeStore,
    boardStore,
    dragPositionOffsetStore,
    movePreviewShadowStore,
  } from "$lib/store";
  import ColorMatrixRenderer from "./ColorMatrixRenderer.svelte";

  let boardElement: HTMLElement;

  const getPosition = ({
    x,
    y,
  }: {
    x: number;
    y: number;
  }): [number, number] => {
    if (!boardElement)
      throw new Error("board is not initialized until getPos be called");

    const { left: boardLeft, top: boardTop } =
      boardElement.getBoundingClientRect();

    return [
      Math.floor(
        (y - boardTop + $dragPositionOffsetStore[1]) / ($blockSizeStore + 3),
      ),
      Math.floor(
        (x - boardLeft + $dragPositionOffsetStore[0]) / ($blockSizeStore + 3),
      ),
    ];
  };
</script>

<div
  id="board-cover"
  bind:this={boardElement}
  role="grid"
  tabindex="0"
  aria-label="Game Board of Blokus"
>
  <ColorMatrixRenderer id="board" matrix={$boardStore}></ColorMatrixRenderer>
</div>

{#if $movePreviewShadowStore && boardElement}
  <div
    id="block-preview-shadow"
    style:top="{$movePreviewShadowStore.position[0] * ($blockSizeStore + 3) +
      boardElement.getBoundingClientRect().top}px"
    style:left="{$movePreviewShadowStore.position[1] * ($blockSizeStore + 3) +
      boardElement.getBoundingClientRect().left}px"
  >
    <ColorMatrixRenderer
      id="block-preview-matrix"
      matrix={$movePreviewShadowStore.blockMatrix}
    ></ColorMatrixRenderer>
  </div>
{/if}

<style>
  #block-preview-shadow {
    position: absolute;
    opacity: 0.3;
    z-index: 100;
    pointer-events: none;
  }
</style>
