<script lang="ts">
  import { onMount } from "svelte";
  import type {
    BoardMatrix,
    CancelReadyMessage,
    ConnectedMessage,
    LeaveMessage,
    MoveMessage,
    ReadyMessage,
    ReportMessage,
    StartMessage,
    WebSocketMessage,
  } from "$lib/types";
  import Board from "$lib/components/Board.svelte";
  import { parseJson } from "$lib/utils";
  import { putBlockOnBoard } from "$lib/game";
  import { modalStore } from "../../../Store";
  import Alert from "$lib/components/Alert.svelte";
  import type { PageData } from "./$types";

  const { data: room }: { data: PageData } = $props();

  let socket: WebSocket;
  // [TODO] get board from server if started(that means, logics for reconnected is needed)
  let board: BoardMatrix = Array.from(Array(20), () => {
    const newArr: (number | false)[] = [];
    newArr.length = 20;
    return newArr.fill(false);
  });
  let turn = -1;
  let playerIdx: 0 | 1 | 2 | 3 = 0;
  let isStarted = false;
  let players = [];

  const startTurn = () => {
    // [TODO] wait for user input
    // [TODO] push move to local board and to server
  };

  const ready = () => {
    // [TODO] throttle
    const message: ReadyMessage = {
      type: "READY",
      playerIdx,
    };
    socket.send(JSON.stringify(message));
  };

  const cancelReady = () => {
    // [TODO] throttle
    const message: CancelReadyMessage = {
      type: "CANCEL_READY",
      playerIdx,
    };
    socket.send(JSON.stringify(message));
  };

  class WebSocketMessageHandler {
    private handleUserConnected({
      id,
      userId,
      username,
      playerIdx,
    }: ConnectedMessage) {
      throw new Error("not implemented");
    }

    private handleUserLeave({ playerIdx }: LeaveMessage) {
      throw new Error("not implemented");
    }

    private handleReady({ playerIdx }: ReadyMessage) {
      throw new Error("not implemented");
    }

    private handleCancelReady({ playerIdx }: CancelReadyMessage) {
      throw new Error("not implemented");
    }

    private handleMove({
      block,
      flip,
      playerIdx,
      position,
      rotation,
    }: MoveMessage) {
      const reason = putBlockOnBoard({
        board,
        blockInfo: {
          type: block,
          rotation: (rotation % 4) as 0 | 1 | 2 | 3,
          flip,
        },
        playerIdx,
        position,
        turn: ++turn,
      });
      if (!reason) {
        return;
      }
      modalStore.open(Alert, {
        title: "inproper move detected",
        message: `reporting to server<br>cause: ${reason}`,
      });
      const message: ReportMessage = {
        type: "REPORT",
        block,
        flip,
        playerIdx,
        position,
        rotation,
        turn,
        // [TODO] check the saved board to clarify the move is proper
      };
      socket.send(JSON.stringify(message));
    }

    private handleStart({}: StartMessage) {
      if (!isStarted) {
        turn = 0;
        if (playerIdx === 0) {
          startTurn();
        }
        return;
      }
      modalStore.open(Alert, {
        title: "someone started game again",
        message: "reporting abusing",
      });
    }

    handleMessage(message: WebSocketMessage) {
      switch (message.type) {
        case "LEAVE":
          this.handleUserLeave(message);
          break;
        case "READY":
          this.handleReady(message);
          break;
        case "CANCEL_READY":
          this.handleCancelReady(message);
          break;
        case "MOVE":
          this.handleMove(message);
          if (playerIdx === turn % 3) {
            startTurn();
          }
          break;
        case "START":
          this.handleStart(message);
          break;
        case "CONNECTED":
          this.handleUserConnected(message);
          break;
        default:
          modalStore.open(Alert, {
            title: "received unknown message",
            message,
          });
          break;
      }
    }
  }

  onMount(() => {
    // [TODO] consider reconnect
    const url = new URL(window.location.href);

    socket = new WebSocket(
      `${url.protocol === "http:" ? "ws" : "wss"}://${url.host}${url.pathname}`,
    );
    const webSocketMessageHandler = new WebSocketMessageHandler();

    socket.onmessage = (e) => {
      const message = parseJson<WebSocketMessage>(e.data);
      if (typeof message === "string") {
        return;
      }
      webSocketMessageHandler.handleMessage(message);
    };
  });
</script>

<Board {board} />
