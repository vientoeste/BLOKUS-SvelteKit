import { createFilter } from "$lib/filter";
import type { SlotIdx } from "$types";
import { writable, type Writable } from "svelte/store";

type Filter<T> = ReturnType<typeof createFilter<T>>;

export class BlockFilterStateManager {
  private quantitySource: Writable<number[]>;
  private colorSource: Writable<SlotIdx[]>;
  public quantity: Filter<number>;
  public color: Filter<SlotIdx>;

  constructor() {
    this.quantitySource = writable([1, 2, 3, 4, 5]);
    this.colorSource = writable([]);

    this.quantity = createFilter(this.quantitySource);
    this.color = createFilter(this.colorSource);
  }


  initialize(clientSlots: SlotIdx[]) {
    this.colorSource.set(clientSlots);
  }

  reset() {
    this.quantitySource.set([1, 2, 3, 4, 5]);
    this.quantity.selected.set([1, 2, 3, 4, 5]);
    this.colorSource.set([]);
  }
}
