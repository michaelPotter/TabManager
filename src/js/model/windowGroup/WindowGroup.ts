import Window from "../window/Window";

// NOTE: think through how this could work with archived windows.
// I had thought of having this class use a generic to so it handles EITHER active windows or archived windows, but I like the idea of having a group where say 2 windows are "archived" and one is active and tracking real windows. So maybe it'd be better for _windows to have a type that is a sum-type of active and archived windows.

/**
 * Represents a group of windows.
 */
export type WindowGroup = {
	name: string;
	windows: Window[];
}

export type SerializedWindowGroup = {
	name: string;
	/** A list of window IDs. */
	windows: number[];
}

