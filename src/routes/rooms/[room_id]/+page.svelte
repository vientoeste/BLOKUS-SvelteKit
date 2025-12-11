<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { GameClientFactory, GameManager } from "$lib/client/game";
  import { modalStore } from "$lib/store";
  import { goto } from "$app/navigation";
  import Alert from "$lib/components/Alert.svelte";
  import Board from "$lib/components/Board.svelte";
  import Controller from "$lib/components/Controller.svelte";
  import Players from "$lib/components/Players.svelte";
  import type { Block, BoardMatrix, PlayerIdx, SlotIdx } from "$types";
  import type { PageData } from "./$types";
  import { createGameContext } from "$lib/client/game/context";

  const { data }: { data: PageData } = $props();
  const { room, playerIdx, roomCache, moves } = data;

  let socket: WebSocket;

  let worker: Worker | null = null;
  let gameManager: GameManager;
  const gameContext = createGameContext();
  let isGameInitialized = $state(false);

  onDestroy(() => {
    socket?.close();

    worker?.terminate();
    gameManager?.terminate();
  });

  onMount(async () => {
    // if goto called at the outside of onMount, it would be considered as server-side
    // so 'throw redirect' at client side is unnecessary, just call goto after mounted
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

    // [TODO] consider reconnect
    const url = new URL(window.location.href);

    socket = new WebSocket(
      `${url.protocol === "http:" ? "ws" : "wss"}://${url.host}${url.pathname}`,
    );
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
    const { stateLayer, presentationLayer } = ({ gameManager } =
      GameClientFactory.create({
        webWorker: worker,
        webSocket: socket,

        context: {
          playerIdx: playerIdx as PlayerIdx,
          players,
        },
      }));
    gameContext.initialize({
      state: stateLayer,
      actions: gameManager,
      presentation: presentationLayer,
    });
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
    position: [number, number];
    blockInfo: Block;
    slotIdx: SlotIdx;
  }) => {
    gameManager?.submitMove(param);
  };

  const startGame = () => {
    gameManager?.startGame();
  };
</script>

{#if isGameInitialized}
  <Players
    ready={() => {
      gameManager.submitReady();
    }}
    unready={() => {
      gameManager.submitCancelReady();
    }}
  ></Players>
  <Board {submitMove} />

  <Controller {startGame}></Controller>
{/if}
