<script lang="ts">
  import type { PageData } from "./$types";
  import { io } from "socket.io-client";
  const socket = io();
  export let data: PageData;
</script>

<h2>Rooms</h2>

{@html data.rooms.join("<br>")}

<form method="POST" action="?/createRoom" class="createRoom">
  <input type="text" name="name" placeholder="방 제목" required />
  <input type="hidden" name="creator" value={data.creator} />
  <button>New Room</button>
</form>
