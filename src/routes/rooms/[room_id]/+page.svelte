<script lang="ts">
  import { onMount } from "svelte";
  import type { ConnectedMessage } from "$lib/types";

  let socket: WebSocket;

  onMount(() => {
    const url = new URL(window.location.href);

    socket = new WebSocket(
      `${url.protocol === "http:" ? "ws" : "wss"}://${url.host}${url.pathname}`,
    );

    socket.addEventListener("open", function (event) {
      const message: ConnectedMessage = { type: "CONNECTED" };
      socket.send(JSON.stringify(message));
    });
    socket.addEventListener("message", (e) => {
      // [TODO] handle messages here
    });
  });
</script>
