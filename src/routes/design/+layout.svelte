<script lang="ts">
  import BlocksContainer from "$lib/components/game/BlocksContainer.svelte";
  import Chat from "$lib/components/game/Chat.svelte";
  import Participants from "$lib/components/game/Participants.svelte";
  import {
    blockSizeStore,
    blockStore,
    innerHeightStore,
    unusedBlockStore,
  } from "$lib/store";
  import { onMount } from "svelte";
  import "../../app.css";
  import { BlockStateManager, BoardStateManager } from "$lib/client/game/state";

  let { children } = $props();
  onMount(() => {
    new BoardStateManager().initializeBoard();
    blockStore.initialize([0, 2]);
  });
</script>

<svelte:window bind:innerHeight={$innerHeightStore} />
<div style="position: absolute; top: 100px; left: 100px;">
  <button
    onclick={() => {
      console.log($unusedBlockStore);
    }}>dd</button
  >
</div>
<div
  id="layout-cover"
  style="--block-size: {$blockSizeStore}px; --innerHeight: {$innerHeightStore}px;"
>
  <div id="left-container">
    <div id="participant-container">
      <Participants></Participants>
    </div>
    <div id="chat-container">
      <Chat></Chat>
    </div>
  </div>
  <div id="center-container">
    {@render children()}
  </div>
  <div id="right-container">
    <div id="blocks-container">
      <BlocksContainer></BlocksContainer>
    </div>
  </div>
</div>

<style>
  #layout-cover {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    height: calc((var(--block-size) + 4px) * 20 - 19px);
  }

  #center-container {
    width: calc((var(--block-size) + 4px) * 20 - 19px);
    height: 100%;
  }

  #left-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-width: calc(var(--block-size) * 5 + 4px);
  }

  #chat-container {
    height: 100%;
  }

  #blocks-container {
    height: 100%;
  }

  #right-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-width: calc(var(--block-size) * 5 + 4px);
  }

  :root {
    --none: #b9b9b9;
    --blue: rgba(0, 0, 255, 0.625);
    --red: rgba(255, 0, 0, 0.65);
    --yellow: rgb(0, 220, 0, 0.625);
    --green: rgb(255, 255, 0, 0.75);
  }
</style>
