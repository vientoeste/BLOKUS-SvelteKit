<script lang="ts">
  import { useGame } from "$lib/client/game/context";
  import {
    blockSizeStore,
    dragPositionOffsetStore,
    movePreviewShadowStore,
    moveStore,
  } from "$lib/store";
  import ColorMatrixRenderer from "./ColorMatrixRenderer.svelte";

  let boardElement: HTMLElement | null = $state(null);

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

  const handleDrop = (event: DragEvent) => {
    event.preventDefault();

    const position = getPosition({ x: event.clientX, y: event.clientY });
    dragPositionOffsetStore.set([0, 0]);

    try {
      if ($moveStore === null) throw new Error("move store is empty");
      const { type, rotation, flip, slotIdx } = $moveStore;
      if (type === undefined || rotation === undefined || flip === undefined) {
        throw new Error("missing blockInfo");
      }
      $moveStore = null;
      $movePreviewShadowStore = null;

      submitMove({
        position,
        blockInfo: { type, rotation, flip },
        slotIdx,
        previewUrl: "",
      });
    } catch (error) {
      console.error("DnD(drop):", error);
    }
  };

  const handleDragOver = (event: DragEvent) => {
    event.preventDefault();
    if ($moveStore === null || $moveStore.matrix === undefined) return;

    const position = getPosition({ x: event.clientX, y: event.clientY });
    const currentPreview = $movePreviewShadowStore;
    if (
      currentPreview?.position[0] === position[0] &&
      currentPreview?.position[1] === position[1]
    ) {
      return;
    }

    $movePreviewShadowStore = {
      blockMatrix: $moveStore.matrix,
      position,
    };
  };

  const { state: gameState, actions } = useGame();
  const boardStore = $gameState?.board.matrix;
  const submitMove = $actions.submitMove;
</script>

<div
  id="board-cover"
  bind:this={boardElement}
  role="grid"
  tabindex="0"
  aria-label="Game Board of Blokus"
  ondrop={handleDrop}
  ondragover={handleDragOver}
>
  {#if $boardStore !== undefined}
    <ColorMatrixRenderer id="board" matrix={$boardStore}></ColorMatrixRenderer>
  {/if}
</div>

{#if $movePreviewShadowStore && boardElement}
  <div
    id="block-preview-shadow"
    style:top="{$movePreviewShadowStore.position[0] * ($blockSizeStore + 3)}px"
    style:left="{$movePreviewShadowStore.position[1] * ($blockSizeStore + 3)}px"
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
