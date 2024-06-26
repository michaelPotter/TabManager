import Window from "../window/Window";

// NOTE: think through how this could work with archived windows.
// I had thought of having this class use a generic to so it handles EITHER active windows or archived windows, but I like the idea of having a group where say 2 windows are "archived" and one is active and tracking real windows. So maybe it'd be better for _windows to have a type that is a sum-type of active and archived windows.

/**
 * Represents a group of windows.
 */
export default class WindowGroup {
	private _name: string = "";
	private _windows: Window[] = [];

	constructor() {
	}

	get name() { return this._name; }
	set name(name: string) { this._name = name; }

	get windows() { return this._windows; }
	set windows(windows: Window[]) { this._windows = windows; }

}

export type SerializedWindowGroup = {
	name: string;
	/** A list of window IDs. */
	// TODO think this through. Window IDs work for active windows, but archived windows will need more info... since we can't just use the ID to get the window data. Like maybe archived windowgroups need to have a list of windowobjects, that each need to have a list of tabs.
	windows: number[];
}

