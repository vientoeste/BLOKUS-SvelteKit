<script lang="ts">
  // [TODO] DnD should be added
  import {
    blockSizeStore,
    boardStore,
    dragPositionOffsetStore,
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
