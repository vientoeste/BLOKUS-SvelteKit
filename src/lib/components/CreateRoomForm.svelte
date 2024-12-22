<script lang="ts">
  import { goto } from "$app/navigation";
  import type { ApiResponse, CreateRoomResponse } from "$lib/types";
  import { isFormDataFieldsValid, parseJson } from "$lib/utils";
  import { modalStore } from "../../Store";
  import Alert from "./Alert.svelte";

  const submitCreateRoom = async (e: Event) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget as HTMLFormElement);
    const name = data.get("name")?.toString();

    if (!isFormDataFieldsValid(data, ["name"])) {
      alert("check the form: corrupted");
      return;
    }
    const rawResponse = await fetch("api/rooms", {
      body: JSON.stringify({ name }),
      method: "POST",
    });
    const response = parseJson<ApiResponse<CreateRoomResponse>>(
      await rawResponse.text(),
    );
    if (typeof response === "string") {
      modalStore.open(Alert, {
        title: "failed to create room",
        message: "unknwon error occured: please try again",
      });
      return;
    }
    const { type, status } = response;
    if (type === "failure") {
      modalStore.open(Alert, {
        title: "failed to create room",
        message: response.error.message,
      });
      return;
    }
    const { roomId } = response.data;
    goto(`rooms/${roomId}`);
  };
</script>

<div id="create-room-form">
  <form id="create-room" onsubmit={submitCreateRoom}>
    <input
      type="text"
      name="name"
      aria-required="true"
      placeholder="enter the name of room"
    />
    <button type="submit">Let's go!</button>
  </form>
</div>

<style>
</style>
