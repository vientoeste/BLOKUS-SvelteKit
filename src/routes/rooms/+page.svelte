<script lang="ts">
  import CreateRoomForm from "$lib/components/CreateRoomForm.svelte";
  import Room from "$lib/components/RoomPreview.svelte";
  import Alert from "$lib/components/Alert.svelte";
  import { goto } from "$app/navigation";
  import type {
    ApiResponse,
    FetchRoomPreviewsResponse,
    RoomPreviewInf,
  } from "$types";
  import { onMount } from "svelte";
  import { modalStore } from "../../Store";
  import { clearLocalStorageAuthStatus, parseJson } from "$lib/utils";
  import { page } from "$app/stores";

  const storedRooms: RoomPreviewInf[] = [];
  const displayedRooms: RoomPreviewInf[] = $state([]);

  onMount(async () => {
    const error = $page.url.searchParams.get("error");
    if (error !== null) {
      modalStore.open(Alert, {
        title: "error occured",
        message: error.replace(/\_/g, " "),
      });
    }
    const rawResponse = await fetch("api/rooms", {
      credentials: "same-origin",
    });
    const response = parseJson<ApiResponse<FetchRoomPreviewsResponse>>(
      await rawResponse.text(),
    );
    if (typeof response === "string") {
      modalStore.open(Alert, {
        title: "failed to get rooms",
        message: "unknown error occured: please try again",
      });
      return goto("/");
    }

    const { status, type } = response;
    if (type === "failure") {
      clearLocalStorageAuthStatus(localStorage);
      modalStore.open(Alert, {
        title: "failed to get rooms",
        message: response.error.message,
      });
      return goto("/");
    }
    const { rooms } = response.data;
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
