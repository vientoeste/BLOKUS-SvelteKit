<script lang="ts">
  import type { BlockMatrix, BlockType } from "$types";
  import { dragPositionOffsetStore, moveStore } from "../../Store";
  import Block from "./Block.svelte";

  let { type, block } = $props<{
    type: BlockType;
    block: ({ u: boolean; r: boolean; b: boolean; l: boolean } | null)[][];
  }>();

  let blockMatrix: ({
    u: boolean;
    r: boolean;
    b: boolean;
    l: boolean;
  } | null)[][] = $state(block);

  function handleDragStart(event: DragEvent) {
    if (!event.dataTransfer) return;

    if ($moveStore === null) {
      moveStore.set({
        flip: false,
        rotation: 0,
        type,
      });
    }

    event.dataTransfer.effectAllowed = "move";

    const element = event.target as HTMLElement;
    element.style.opacity = "0.4";

    const blockElement = event.target;
    if (blockElement === null) {
      // [TODO] I've never reached this line, but debug will be needed when this line executed during actual game
      console.log("blockelement is null");
      return;
    }
    const blockRect = (blockElement as HTMLElement).getBoundingClientRect();

    dragPositionOffsetStore.set([
      blockRect.left + 16 - event.clientX,
      blockRect.top + 16 - event.clientY,
    ]);
  }

  function handleDragEnd(event: DragEvent) {
    const element = event.target as HTMLElement;
    element.style.opacity = "1";
    // [TODO] clear highlightedCells
  }

  let controllerVisibillity = $state(false);

  // [TODO] please refactor this stinky things
  function rotateBlock() {
    moveStore.update((move) => {
      if (move === null || move.type !== type)
        return {
          type,
          flip: false,
          rotation: 1,
        };
      return {
        type,
        flip: move.flip,
        rotation: ((move.rotation + 1) % 4) as 0 | 1 | 2 | 3,
      };
    });
    const rotated = Array.from(Array(blockMatrix[0].length), () => {
      const newArr: ({
        u: boolean;
        r: boolean;
        b: boolean;
        l: boolean;
      } | null)[] = [];
      newArr.length = blockMatrix.length;
      return newArr.fill(null);
    });

    blockMatrix.forEach((blockLine, rowIdx) => {
      blockLine.forEach((cell, colIdx) => {
        rotated[colIdx][blockMatrix.length - rowIdx - 1] =
          cell === null
            ? null
            : {
                u: cell?.l,
                r: cell?.u,
                b: cell?.r,
                l: cell?.b,
              };
      });
    });
    blockMatrix = rotated;
  }

  function flipBlock() {
    moveStore.update((move) => {
      if (move === null || move.type !== type)
        return {
          type,
          flip: true,
          rotation: 0,
        };
      return {
        type,
        flip: !move.flip,
        rotation: move.rotation,
      };
    });
    blockMatrix = blockMatrix.reverse().map((blockLine) =>
      blockLine.map((cell) =>
        cell === null
          ? null
          : {
              ...cell,
              u: cell?.b,
              b: cell?.u,
            },
      ),
    );
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
  class="block"
  role="button"
  onclick={() => (controllerVisibillity = !controllerVisibillity)}
  draggable="true"
  tabindex="0"
  ondragstart={handleDragStart}
  ondragend={handleDragEnd}
  aria-label="draggable"
>
  <Block block={blockMatrix}></Block>

  {#if controllerVisibillity}
    <div class="block-control-panel">
      <button onclick={rotateBlock}>rotate</button>
      <button onclick={flipBlock}>flip</button>
    </div>
  {/if}
</div>

<style>
  .block {
    display: inline-block;
    cursor: move;
    margin: 2px;
  }
</style>
