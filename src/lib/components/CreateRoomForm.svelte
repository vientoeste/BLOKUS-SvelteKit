<script lang="ts">
  import { goto } from "$app/navigation";
  import { isFormDataFieldsValid } from "$lib/utils";

  const submitCreateRoom = async (e: Event) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget as HTMLFormElement);
    const name = data.get("name")?.toString();

    if (!isFormDataFieldsValid(data, ["name"])) {
      alert("check the form: corrupted");
      return;
    }
    const response = await fetch("api/rooms", {
      body: JSON.stringify({ name }),
      method: "POST",
    });
    const { roomId } = await response.json();
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
