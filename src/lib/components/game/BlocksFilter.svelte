<script lang="ts">
  import { createFilter } from "$lib/filter.svelte";
  import { clientSlotStore } from "$lib/store";
  import { colorMapper } from "$lib/utils";
  import type { SlotIdx } from "$types";

  // [TODO] disable empty filters
  const quantities = [5, 4, 3, 2, 1];

  let quantityFilter: ReturnType<typeof createFilter<number>> = createFilter(
    () => quantities,
  );
  let colorFilter: ReturnType<typeof createFilter<SlotIdx>> = createFilter(
    () => $clientSlotStore,
  );
</script>

<div id="filter-container">
  <div id="quantity-filter-group" class="filter-group">
    <div class="filter-select-all">
      <div class="filter-option">
        <input
          type="checkbox"
          id="quantity-select-all"
          onclick={quantityFilter.toggleAll}
          checked={quantityFilter.allSelected}
          indeterminate={quantityFilter.indeterminate}
        />
        <label for="quantity-select-all">Select All</label>
      </div>
    </div>
    <div class="filter-options-wrapper">
      {#each quantities as quantity}
        <div class="filter-option">
          <input
            type="checkbox"
            id="quantity-{quantity}"
            onchange={() => quantityFilter.toggleItem(quantity)}
            checked={quantityFilter.selected.includes(quantity)}
          />
          <label for="quantity-{quantity}">{quantity}</label>
        </div>
      {/each}
    </div>
  </div>

  <hr />

  <div id="color-filter-group" class="filter-group">
    <div class="filter-select-all">
      <div class="filter-option">
        <input
          type="checkbox"
          id="color-select-all"
          onclick={colorFilter.toggleAll}
          checked={colorFilter.allSelected}
          indeterminate={colorFilter.indeterminate}
        />
        <label for="color-select-all">Select All</label>
      </div>
    </div>
    <div class="filter-options-wrapper">
      {#each $clientSlotStore as slotIdx}
        {@const color = colorMapper(slotIdx).toLowerCase()}
        <div class="filter-option">
          <input
            type="checkbox"
            id="color-{color}"
            onchange={() => colorFilter.toggleItem(slotIdx)}
            checked={colorFilter.selected.includes(slotIdx)}
          />
          <label for="color-{color}">{color}</label>
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  input {
    color: #494949;
    border: 0;
    border-radius: 0;
    width: 16px;
    height: 16px;
  }

  input:checked {
    accent-color: #b9b9b9;
  }

  #filter-container {
    border-radius: 10px;
    background-color: var(--red);
    padding: 10px;
  }

  .filter-group {
    display: flex;
    padding: 8px;
    flex-direction: row;
    gap: 24px;
    background-color: var(--background);
    align-items: center;
  }

  .filter-option {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 6px;
  }

  .filter-options-wrapper {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 16px;
  }
</style>
