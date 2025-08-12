<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { goto } from "$app/navigation";
  import Alert from "$lib/components/Alert.svelte";
  import Board from "$lib/components/Board.svelte";
  import Controller from "$lib/components/Controller.svelte";
  import Players from "$lib/components/Players.svelte";
  import {
    BlockPlacementValidator,
    GameManager_Legacy,
  } from "$lib/game/client.svelte";
  import { WebSocketMessageDispatcher } from "$lib/websocket/client";
  import {
    blockStore,
    gameStore,
    modalStore,
    participantStore,
  } from "$lib/store";
  import type {
    BoardMatrix,
    ParticipantInf,
    PlayerIdx,
    Rotation,
    SubmitMoveDTO,
  } from "$types";
  import type { PageData } from "./$types";
  import { getPlayersSlot } from "$lib/utils";
  import { PlayerStateManager } from "$lib/client/game/state/player";
  import { EventBus } from "$lib/client/game/event";
  import { WebSocketMessageReceiver } from "$lib/client/game/network/receiver";

  const { data }: { data: PageData } = $props();
  const { room, playerIdx, roomCache, moves } = data;

  let socket: WebSocket;
  // [TODO] get board from server if started(that means, logics for reconnected is needed)
  let board: BoardMatrix = Array.from(Array(20), () => {
    const newArr: (number | false)[] = [];
    newArr.length = 20;
    return newArr.fill(false);
  });

  let worker: Worker | null = null;
  let gameManager: GameManager_Legacy | null = $state(null);
  let messageReceiver: WebSocketMessageReceiver;
  let messageDispatcher: WebSocketMessageDispatcher;
  let blockPlacementValidator: BlockPlacementValidator;
  let playerStateManager: PlayerStateManager;
  let eventBus = new EventBus();

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
    $gameStore.playerIdx = playerIdx as PlayerIdx;
    $gameStore.isStarted = room.isStarted;
    $gameStore.turn = roomCache.turn;

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

    messageReceiver = new WebSocketMessageReceiver({
      eventBus,
      webSocket: socket,
    });
    messageDispatcher = new WebSocketMessageDispatcher(socket);
    blockPlacementValidator = new BlockPlacementValidator(worker);
    playerStateManager = new PlayerStateManager({
      players: [roomCache.p0, roomCache.p1, roomCache.p2, roomCache.p3],
      playerIdx: playerIdx as PlayerIdx,
      slots: [],
    });
    gameManager = new GameManager_Legacy({
      board,
      gameId: roomCache.gameId,
      turn: roomCache.turn ?? -1,
      playerIdx: $gameStore.playerIdx,
      messageReceiver,
      messageDispatcher,
      playerStateManager,
      blockPlacementValidator,
      eventBus,
    });

    if (roomCache.started) {
      $gameStore.mySlots = getPlayersSlot({
        playerIdx: $gameStore.playerIdx,
        players: $participantStore,
      });
      playerStateManager.initializeClientSlots();
      gameManager?.restoreGameState(moves);
    }
  });

  onDestroy(() => {
    worker?.terminate();
  });
</script>

<Players
  ready={() => {
    gameManager?.ready();
  }}
  unready={() => {
    gameManager?.unready();
  }}
></Players>
<Board
  relayMove={({
    position,
    blockInfo: { type, rotation, flip },
    slotIdx,
  }: SubmitMoveDTO) => {
    gameManager?.submitMove({
      blockInfo: {
        type,
        flip,
        rotation: (rotation % 4) as Rotation,
      },
      slotIdx,
      position,
    });
  }}
  board={gameManager?.board}
/>

<Controller startGame={() => gameManager?.startGame()}></Controller>
