<script lang="ts">
  import { useGame } from "$lib/client/game/context";
  import { colorMapper } from "$lib/utils";

  const { state } = useGame();
  const quantityFilter = $state.filter.quantity;
  const colorFilter = $state.filter.color;

  const allQuantitiesSelected = quantityFilter.allSelected;
  const indeterminateQuantity = quantityFilter.indeterminate;
  const quantities = quantityFilter.items;
  const selectedQuantities = quantityFilter.selected;

  const allColorsSelected = colorFilter.allSelected;
  const indeterminateColor = colorFilter.indeterminate;
  const colors = colorFilter.items;
  const selectedColors = colorFilter.selected;
</script>

<div id="filter-container">
  <div id="quantity-filter-group" class="filter-group">
    <div class="filter-select-all">
      <div class="filter-option">
        <input
          type="checkbox"
          id="quantity-select-all"
          onclick={quantityFilter.toggleAll}
          checked={$allQuantitiesSelected}
          indeterminate={$indeterminateQuantity}
        />
        <label for="quantity-select-all">Select All</label>
      </div>
    </div>
    <div class="filter-options-wrapper">
      {#each $quantities as quantity}
        <div class="filter-option">
          <input
            type="checkbox"
            id="quantity-{quantity}"
            onchange={() => quantityFilter.toggleItem(quantity)}
            checked={$selectedQuantities.includes(quantity)}
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
          checked={$allColorsSelected}
          indeterminate={$indeterminateColor}
        />
        <label for="color-select-all">Select All</label>
      </div>
    </div>
    <div class="filter-options-wrapper">
      {#each $colors as slotIdx}
        {@const color = colorMapper(slotIdx).toLowerCase()}
        <div class="filter-option">
          <input
            type="checkbox"
            id="color-{color}"
            onchange={() => colorFilter.toggleItem(slotIdx)}
            checked={$selectedColors.includes(slotIdx)}
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
