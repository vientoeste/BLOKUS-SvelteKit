<script lang="ts">
  import { goto } from "$app/navigation";
  import type { ApiResponse, RoomPreviewInf } from "$lib/types";
  import { parseJson } from "$lib/utils";
  import { modalStore } from "../../Store";
  import Alert from "./Alert.svelte";
  interface $$Props extends RoomPreviewInf {}

  const room = $props() as RoomPreviewInf;
  const { id, name, players, isStarted } = room;
</script>

<a
  href="rooms/{id}"
  class="room row-layout"
  onclick={async (e) => {
    e.preventDefault();
    if (isStarted) {
      modalStore.open(Alert, {
        title: "game is in progress",
        message: "try join other room",
      });
      return;
    }
    const rawResponse = await fetch(`api/rooms/${id}/join`, {
      method: "POST",
      credentials: "same-origin",
    });
    const response = parseJson<ApiResponse<{ idx: number }>>(
      await rawResponse.text(),
    );
    if (typeof response === "string") {
      return;
    }
    const { type } = response;
    if (type === "success") {
      goto(`rooms/${id}`);
    }
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
