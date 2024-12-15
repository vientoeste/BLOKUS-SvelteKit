<script lang="ts">
  import CreateRoomForm from "$lib/components/CreateRoomForm.svelte";
  import Room from "$lib/components/RoomPreview.svelte";
  import Alert from "$lib/components/Alert.svelte";
  import { goto } from "$app/navigation";
  import type { RoomInf } from "$lib/types";
  import { onMount } from "svelte";
  import { modalStore } from "../../Store";

  const storedRooms: RoomInf[] = [];
  const displayedRooms: RoomInf[] = $state([]);
  onMount(async () => {
    const response = await fetch("api/rooms");
    if (response.status === 401) {
      const { message } = await response.json();
      modalStore.open(Alert, {
        title: "need to sign in first",
        message,
      });
      goto("/");
    }
    const { rooms } = (await response.json()) as { rooms: RoomInf[] };
    displayedRooms.push(...rooms);
    storedRooms.push(...rooms);
  });
</script>

<button onclick={() => modalStore.open(CreateRoomForm)}>create new room</button>
<div id="rooms-container">
  {#each displayedRooms as roomData (roomData.id)}
    <Room {...roomData} />
  {/each}
</div>

<div id="page-navigation-container">
  <div id="prev-button-wrapper">
    <button id="prev-button">prev</button>
  </div>
</div>
