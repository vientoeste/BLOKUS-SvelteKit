<script lang="ts">
  // [TODO] add color to progression bar
  import TurnTimer from "$lib/components/game/TurnTimer.svelte";
  import { blockSizeStore, isDraggingBlock } from "$lib/store";
  import { onMount } from "svelte";

  let position = $state({ x: 0, y: 0 });

  let isSelfDragging = $state(false);
  let dragStartOffset = $state({ x: 0, y: 0 });

  let selfElement: HTMLDivElement | undefined = $state();
  let parentElement: HTMLElement | undefined = $state();

  let isBlockHovering = $state(false);

  let pointerEvents = $derived($isDraggingBlock ? "none" : "auto");
  let opacity = $derived(isBlockHovering ? 0.2 : 0.8);

  onMount(() => {
    if (selfElement) {
      parentElement = selfElement.parentElement as HTMLElement;
    }
  });

  /**
   * Event handler for starting timer overlay component drag.
   */
  const handlePointerDown = (event: PointerEvent) => {
    if ($isDraggingBlock || !selfElement) return;

    event.preventDefault();
    isSelfDragging = true;

    const selfRect = selfElement.getBoundingClientRect();
    dragStartOffset = {
      x: event.clientX - selfRect.left,
      y: event.clientY - selfRect.top,
    };

    selfElement.setPointerCapture(event.pointerId);
    selfElement.style.cursor = "grabbing";
  };

  /**
   * Event handler for timer overlay component drag.
   */
  const handlePointerMove = (event: PointerEvent) => {
    if (!isSelfDragging || !selfElement || !parentElement) {
      return;
    }

    const parentRect = parentElement.getBoundingClientRect();
    const selfRect = selfElement.getBoundingClientRect();

    const potentialX = event.clientX - parentRect.left - dragStartOffset.x;
    const potentialY = event.clientY - parentRect.top - dragStartOffset.y;

    position.x = Math.max(
      0,
      Math.min(potentialX, parentRect.width - selfRect.width),
    );
    position.y = Math.max(
      0,
      Math.min(potentialY, parentRect.height - selfRect.height),
    );
  };

  /**
   * Event handler for dropping timer overlay component.
   */
  const handlePointerUp = (event: PointerEvent) => {
    if (!isSelfDragging || !selfElement) return;

    isSelfDragging = false;
    selfElement.releasePointerCapture(event.pointerId);
    selfElement.style.cursor = "grab";
  };

  /**
   * Event handler for detecting block component's hovering.
   * This function watches global window dragging event since
   * property 'pointer-events: none' prevents ondragenter event.
   */
  const handleWindowDragOver = (event: DragEvent) => {
    if (!$isDraggingBlock || !selfElement) {
      if (isBlockHovering) isBlockHovering = false;
      return;
    }

    const rect = selfElement.getBoundingClientRect();
    const x = event.clientX;
    const y = event.clientY;

    const isInside =
      x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;

    isBlockHovering = isInside;
  };

  isDraggingBlock.subscribe((store) => {
    if (!store) isBlockHovering = false;
  });
</script>

<svelte:window ondragover={handleWindowDragOver} />

<div
  class="overlay-wrapper"
  style="
    transform: translate({position.x}px, {position.y}px);
    opacity: {opacity};
    width: {6 * ($blockSizeStore + 2)}px;
    height: {2 * ($blockSizeStore + 2)}px;
    pointer-events: {pointerEvents};
  "
  onpointerdown={handlePointerDown}
  onpointermove={handlePointerMove}
  onpointerup={handlePointerUp}
  onpointerleave={handlePointerUp}
  aria-label="timer overlay"
  aria-live="polite"
  role="region"
  bind:this={selfElement}
  draggable="false"
>
  <!-- [TODO] add text component here -->
  <TurnTimer width={5 * ($blockSizeStore + 2)} />
</div>

<style>
  .overlay-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    padding: 8px;
    background-color: #d9d9d9;
    border-radius: 10px;
    z-index: 50;
    touch-action: none;
    cursor: grab;
    transition: opacity 0.2s ease-in-out;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .overlay-wrapper:active {
    cursor: grabbing;
  }
</style>
