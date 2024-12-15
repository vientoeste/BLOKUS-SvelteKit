<script lang="ts">
  import type { RoomInf } from "$lib/types";
  interface $$Props extends RoomInf {}

  const room = $props();
  const { id, name, players } = room;
</script>

<a href="rooms/{id}" class="room" data-sveltekit-preload-data>
  <div class="room-title">{name}</div>
  <div class="room-creator">{players[0].username}</div>
</a>
