<script lang="ts">
  import type { BlockType, Rotation, SlotIdx } from "$types";
  import { dragPositionOffsetStore, modalStore, moveStore } from "$lib/store";
  import Block from "./Block.svelte";
  import Alert from "./Alert.svelte";
  import { onMount } from "svelte";

  let {
    type,
    block,
    blockState,
    slotIdx,
    isAvailable,
  }: {
    type: BlockType;
    block: ({ u: boolean; r: boolean; b: boolean; l: boolean } | null)[][];
    blockState: Map<BlockType, { rotation: number; flip: boolean }>;
    slotIdx: SlotIdx;
    isAvailable: boolean;
  } = $props();

  onMount(() => {
    if (isAvailable === false && container) {
      container.style.cursor = "not-allowed";
      container.style.opacity = "0.4";
    }
  });

  let blockMatrix: ({
    u: boolean;
    r: boolean;
    b: boolean;
    l: boolean;
  } | null)[][] = $state(block);

  let container: HTMLElement | undefined = $state();

  function handleDragStart(event: DragEvent) {
    if (!isAvailable) {
      modalStore.open(Alert, {
        title: "chosen block is not available",
        content: "",
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
    const state = blockState.get(type);

    moveStore.set({
      type,
      flip: state?.flip ?? false,
      rotation: (state?.rotation ?? 0) as Rotation,
      slotIdx,
    });

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

  function rotateBlockToClockwise() {
    const state = blockState.get(type);
    if (state === undefined) {
      rotateBlockMatrixToClockwise();
      blockState.set(type, {
        rotation: 1,
        flip: false,
      });
      return;
    }
    if (!state.flip) {
      rotateBlockMatrixToClockwise();
      blockState.set(type, {
        rotation: (state.rotation + 1) % 4,
        flip: state.flip,
      });
      return;
    }
    flipBlockMatrix();
    rotateBlockMatrixToCounterClockwise();
    flipBlockMatrix();
    blockState.set(type, {
      rotation: (state.rotation + 3) % 4,
      flip: state.flip,
    });
  }

  // [TODO] please refactor this stinky things
  function rotateBlockMatrixToCounterClockwise() {
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
        rotated[blockMatrix[0].length - colIdx - 1][rowIdx] =
          cell === null
            ? null
            : {
                u: cell?.r,
                r: cell?.b,
                b: cell?.l,
                l: cell?.u,
              };
      });
    });
    blockMatrix = rotated;
  }

  function rotateBlockMatrixToClockwise() {
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

  function flipBlockMatrix() {
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

  function flipBlock() {
    flipBlockMatrix();

    const state = blockState.get(type);
    if (state === undefined) {
      blockState.set(type, {
        rotation: 0,
        flip: true,
      });
      return;
    }
    blockState.set(type, {
      rotation: state.rotation,
      flip: !state.flip,
    });
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
  bind:this={container}
>
  <Block block={blockMatrix} {slotIdx}></Block>

  {#if controllerVisibillity}
    <div class="block-control-panel">
      <button onclick={rotateBlockToClockwise}>rotate</button>
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
