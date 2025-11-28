<script lang="ts">
  import { GameClientFactory, GameManager } from "$lib/client/game";
  import BlocksContainer from "$lib/components/game/BlocksContainer.svelte";
  import Board from "$lib/components/game/Board.svelte";
  import Participants from "$lib/components/game/Participants.svelte";
  import TriplePanelLayout from "$lib/components/TriplePanelLayout.svelte";
  import { modalStore } from "$lib/store";
  import { onMount } from "svelte";
  import type { PageData } from "./$types";
  import Alert from "$lib/components/Alert.svelte";
  import { goto } from "$app/navigation";
  import type { Block, PlayerIdx, SlotIdx } from "$types";
  import BlocksFilter from "$lib/components/game/BlocksFilter.svelte";
  import PregameOverlay from "$lib/components/game/PregameOverlay.svelte";
  import ChatContainer from "$lib/components/game/chat/Container.svelte";
  import { createGameContext } from "$lib/client/game/context";

  const { data }: { data: PageData } = $props();
  const { room, playerIdx, roomCache, moves } = data;

  let socket: WebSocket;

  let worker: Worker | null = null;
  let gameManager: GameManager;

  const createWebSocketUrl = (url: URL) => {
    const protocol = url.protocol === "http:" ? "ws" : "wss";
    const basePath = url.pathname.replace(/^\/v\d+\//, "/");
    return `${protocol}://${url.host}${basePath}`;
  };

  const gameContext = createGameContext();
  let isGameInitialized = $state(false);

  onMount(async () => {
    if (
      playerIdx === undefined ||
      [0, 1, 2, 3].findIndex((e) => e === playerIdx) === -1
    ) {
      modalStore.open(Alert, {
        title: "invalid approach",
        message: "try again please",
      });
      goto("/rooms");
    }

    socket = new WebSocket(createWebSocketUrl(new URL(window.location.href)));
    await new Promise<void>((resolve) => {
      socket.addEventListener("open", () => {
        resolve();
      });
    });
    const workerModule = await import(
      "$lib/workers/checkBlockPlaceability.worker?worker"
    );
    worker = new workerModule.default();
    const players = [roomCache.p0, roomCache.p1, roomCache.p2, roomCache.p3];
    const { stateLayer } = ({ gameManager } = GameClientFactory.create({
      webWorker: worker,
      webSocket: socket,

      context: {
        playerIdx: playerIdx as PlayerIdx,
        players,
      },
    }));
    gameContext.initialize({ state: stateLayer, actions: gameManager });
    isGameInitialized = true;

    // [TODO] to prevent initializing error, add condition for single player game(prevent to start game)
    if (roomCache.started && roomCache.gameId !== undefined) {
      gameManager.restoreGame({
        turn: roomCache.turn,
        exhaustedSlots: roomCache.exhausted
          .map((e, idx) => (e ? idx : undefined))
          .filter((e) => e !== undefined) as SlotIdx[],
        gameId: roomCache.gameId,
        moves,
        // [TODO] add case that phase is 'CONFIRMING_SCORE'
        phase: "IN_PROGRESS",
      });
    }
  });

  const submitMove = (param: {
    previewUrl: string;
    position: [number, number];
    blockInfo: Block;
    slotIdx: SlotIdx;
  }) => {
    gameManager?.submitMove(param);
  };

  const startGame =
    playerIdx === 0
      ? () => {
          gameManager?.startGame();
        }
      : undefined;

  const ready = () => {
    gameManager?.submitReady();
  };

  const unready = () => {
    gameManager?.submitCancelReady();
  };
</script>

{#if isGameInitialized}
  <TriplePanelLayout>
    <div style="position: relative;">
      <Board {submitMove} />
      <PregameOverlay {ready} {unready} {startGame} />
    </div>

    {#snippet left()}
      <div id="left-container">
        <Participants />
        <ChatContainer />
      </div>
    {/snippet}

    {#snippet right()}
      <div id="right-container">
        <BlocksFilter />
        <BlocksContainer />
      </div>
    {/snippet}
  </TriplePanelLayout>
{/if}

<style>
  #right-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    min-width: calc(var(--block-size) * 5 + 4px);
  }

  #left-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    min-width: calc(var(--block-size) * 5 + 4px);
  }
</style>
