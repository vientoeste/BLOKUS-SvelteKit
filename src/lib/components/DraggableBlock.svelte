<script lang="ts">
  import type { BlockMatrix, BlockType } from "$lib/types";
  import {
    draggedBlockMatrixStore,
    dragPositionOffsetStore,
  } from "../../Store";
  import Block from "./Block.svelte";

  let { type, block } = $props<{
    type: BlockType;
    block: ({ u: boolean; r: boolean; b: boolean; l: boolean } | null)[][];
  }>();

  function handleDragStart(event: DragEvent) {
    if (!event.dataTransfer) return;

    const blockData = { type };
    event.dataTransfer.setData("application/json", JSON.stringify(blockData));
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

    draggedBlockMatrixStore.set(block);
  }

  function handleDragEnd(event: DragEvent) {
    const element = event.target as HTMLElement;
    element.style.opacity = "1";
    // [TODO] clear highlightedCells
  }

  let controllerVisibillity = $state(false);

  function rotateBlock() {}

  function flipBlock() {}
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
  <Block {block}></Block>

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
