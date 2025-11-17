<script lang="ts">
  import { turnTimerProgress } from "$lib/store";

  let { width = 30 } = $props();
</script>

<div
  class="timer-container"
  style="--progress: {1 - $turnTimerProgress}; width: {width}px;"
>
  <!-- [TODO] update background color by slot's color -->
  <div class="timer-bar" style="background-color: #000"></div>
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
