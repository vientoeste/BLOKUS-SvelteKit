<script lang="ts">
  import type { PageData } from "./$types";
  import { io, Socket } from "socket.io-client";
  import { onMount } from "svelte";

  let socket: Socket;
  onMount(() => {
    socket = io("/game");
    socket.on("connect", () => {
      console.log("socket connected");
      socket.on("startGame", (data) => {
        console.log("12378234789123");
        console.log("emitted at page", data);
      });
    });
  });
  export let data: PageData;
</script>

<h2>Rooms</h2>

{@html data.rooms.join("<br>")}

<form method="POST" action="?/createRoom" class="createRoom">
  <input type="text" name="name" placeholder="방 제목" required />
  <input type="hidden" name="creator" value={data.creator} />
  <button>New Room</button>
</form>
