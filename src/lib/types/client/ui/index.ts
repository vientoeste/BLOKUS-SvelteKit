/**
 * Represents the semantic color value of a cell, used for rendering in the UI.
 * - `BLUE`, `RED`, `YELLOW`, `GREEN`: Player colors corresponding to slots 0-3.
 * - `NONE`: An empty, playable cell on the board.
 * - `SPACING`: A non-playable empty space, used for visual padding in block previews.
 */
export type ColorValue = "BLUE" | "RED" | "YELLOW" | "GREEN" | "NONE" | "SPACING";

/**
 * Represents the raw data value for a cell's state within the game's data matrix (board, block).
 * - `false`: An empty cell.
 * - `0-3`: A cell occupied by the corresponding player slot.
 * - `-1`: A special value indicating a non-playable spacing cell.
 */
export type RawColor = false | 0 | 1 | 2 | 3 | -1;
