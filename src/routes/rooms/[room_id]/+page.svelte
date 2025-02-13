<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { goto } from "$app/navigation";
  import Alert from "$lib/components/Alert.svelte";
  import Board from "$lib/components/Board.svelte";
  import Controller from "$lib/components/Controller.svelte";
  import Players from "$lib/components/Players.svelte";
  import { GameManager } from "$lib/game/client.svelte";
  import {
    WebSocketMessageDispatcher,
    WebSocketMessageReceiver,
  } from "$lib/websocket/client";
  import { gameStore, modalStore } from "../../../Store";
  import type { BoardMatrix, PlayerIdx, Rotation, SubmitMoveDTO } from "$types";
  import type { PageData } from "./$types";

  const { data: room }: { data: PageData } = $props();

  let socket: WebSocket;
  // [TODO] get board from server if started(that means, logics for reconnected is needed)
  let board: BoardMatrix = Array.from(Array(20), () => {
    const newArr: (number | false)[] = [];
    newArr.length = 20;
    return newArr.fill(false);
  });

  let gameManager: GameManager | null = $state(null);
  let messageReceiver: WebSocketMessageReceiver;
  let messageDispatcher: WebSocketMessageDispatcher;

  onDestroy(() => {
    socket?.close();
  });

  onMount(() => {
    // if goto called at the outside of onMount, it would be considered as server-side
    // so 'throw redirect' at client side is unnecessary, just call goto after mounted
    if (
      room.playerIdx === undefined ||
      [0, 1, 2, 3].findIndex((e) => e === room.playerIdx) === -1
    ) {
      modalStore.open(Alert, {
        title: "invalid approach",
        message: "try again please",
      });
      goto("/rooms");
    }
    $gameStore.playerIdx = room.playerIdx as PlayerIdx;

    // [TODO] consider reconnect
    const url = new URL(window.location.href);

    socket = new WebSocket(
      `${url.protocol === "http:" ? "ws" : "wss"}://${url.host}${url.pathname}?idx=${room.playerIdx}`,
    );

    messageReceiver = new WebSocketMessageReceiver(socket);
    messageDispatcher = new WebSocketMessageDispatcher(socket);
    gameManager = new GameManager({
      board,
      turn: room.turn ?? -1,
      playerIdx: $gameStore.playerIdx,
      users: [room.p0, room.p1, room.p2, room.p3],
      messageReceiver,
      messageDispatcher,
    });
  });
</script>

<Players
  players={gameManager?.users ?? []}
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
  }: SubmitMoveDTO) => {
    gameManager?.submitMove({
      blockInfo: {
        type,
        flip,
        rotation: (rotation % 4) as Rotation,
      },
      position,
    });
  }}
  board={gameManager?.board}
/>

<Controller startGame={() => gameManager?.startGame()}></Controller>
