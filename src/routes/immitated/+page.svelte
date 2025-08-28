<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { goto } from "$app/navigation";
  import Alert from "$lib/components/Alert.svelte";
  import Board from "$lib/components/Board.svelte";
  import Controller from "$lib/components/Controller.svelte";
  import Players from "$lib/components/Players.svelte";
  import {
    blockStore,
    gameStore,
    modalStore,
    participantStore,
  } from "$lib/store";
  import type { PageData } from "./$types";
  import { getPlayersSlot } from "$lib/utils";
  import { EventBus } from "$lib/client/game/event";

  import { GameClientFactory, GameManager } from "$lib/client/game";
  import type { Block, BoardMatrix, PlayerIdx, SlotIdx } from "$types";

  const { data }: { data: PageData } = $props();
  const { room, playerIdx, roomCache, moves } = data;

  let socket: WebSocket;
  // [TODO] get board from server if started(that means, logics for reconnected is needed)
  // let board: BoardMatrix = Array.from(Array(20), () => {
  //   const newArr: (number | false)[] = [];
  //   newArr.length = 20;
  //   return newArr.fill(false);
  // });

  let worker: Worker | null = null;
  let eventBus = new EventBus();
  let gameManager: GameManager;

  onDestroy(() => {
    gameStore.set({
      isStarted: false,
      mySlots: [],
      playerIdx: 0,
      players: [],
      turn: -1,
      isEnded: false,
    });
    blockStore.set([]);
    socket?.close();
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
    ({ gameManager } = GameClientFactory.create({
      webWorker: worker,
      webSocket: socket,

      context: {
        playerIdx: playerIdx as PlayerIdx,
        players,
      },
    }));

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

  onDestroy(() => {
    worker?.terminate();
  });

  const submitMove = (param: {
    previewUrl: string;
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

<button
  onclick={() => {
    fetch("invalidate", { method: "POST" });
  }}>invalidate redis cache</button
>
