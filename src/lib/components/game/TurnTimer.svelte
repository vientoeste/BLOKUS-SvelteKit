<script lang="ts">
  import { useGame } from "$lib/client/game/context";

  let { width = 30 } = $props();

  const { state } = useGame();
  const turnTimerProgression = $state.timer.progress;

  const activeSlotColor = $state.progress.activeSlotColor;
</script>

<div
  class="timer-container"
  style="--progress: {1 - $turnTimerProgression}; width: {width}px;"
>
  <div
    class="timer-bar"
    style="background-color: var(--{$activeSlotColor})"
  ></div>
</div>

<style>
  .timer-container {
    height: 8px;
    background-color: #eee;
    border-radius: 5px;
    overflow: hidden;
    font-size: 10px;
  }

  .timer-bar {
    height: 100%;
    transform: scaleX(var(--progress));
    transform-origin: left;
  }
</style>
