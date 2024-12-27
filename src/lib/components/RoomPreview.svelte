<script lang="ts">
  import { goto } from "$app/navigation";
  import type { RoomPreviewInf } from "$lib/types";
  import { modalStore } from "../../Store";
  import Alert from "./Alert.svelte";
  interface $$Props extends RoomPreviewInf {}

  const room = $props() as RoomPreviewInf;
  const { id, name, players, isStarted } = room;
</script>

<a
  href="rooms/{id}"
  class="room row-layout"
  onclick={(e) => {
    e.preventDefault();
    if (isStarted) {
      modalStore.open(Alert, {
        title: "game is in progress",
        message: "try join other room",
      });
      return;
    }
    goto(`rooms/${id}`);
  }}
  data-sveltekit-preload-data
>
  <div class="room-title">{name}</div>
  <div class="room-creator">{players[0].username}</div>
  <div class="room-players">{players.length}</div>
  <div class="room-started">
    {isStarted === true ? "in progress" : "not in progress"}
  </div>
</a>

<style>
  .room {
    padding: 10px 0;
  }
</style>
