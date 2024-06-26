import { observable, action, makeObservable } from "mobx";

import Window from "../window/Window";
import WindowManager from "../window/WindowManager";
import WindowGroup from "./WindowGroup";
import WindowGroupBuilder from "./WindowGroupBuilder";

class WindowGroupStore {

	windowGroups: WindowGroup[] = [];

	constructor() {
		makeObservable(this, {
			windowGroups: observable,
			addWindowToGroup: action,
			addWindowToNewGroup: action,
			deleteWindowGroup: action,
			_init: action,
		});

		this._init();
	}

	async _init() {
		await WindowManager.waitForPopulated();
		this.windowGroups = await WindowGroupBuilder.getAll();
	}

	// FIXME we should prevent the same window from being added twice
	addWindowToGroup = (window: Window, groupName: string) => {
		this.windowGroups.find(wg => wg.name === groupName)?.windows.push(window)
		this.#persist();
	}

	addWindowToNewGroup = (window: Window, groupName: string) => {
		this.windowGroups.push(
			WindowGroupBuilder.new(groupName)
				.withWindow(window)
				.build()
		);
		this.#persist();
	}

	deleteWindowGroup = (groupName: string) => {
		this.windowGroups = this.windowGroups.filter(wg => wg.name !== groupName);
		this.#persist();
	}

	removeWindowFromGroup = (window: Window, groupName: string) => {
		const group = this.windowGroups.find(wg => wg.name === groupName);
		if (group) {
			group.windows = group.windows.filter(w => w.id !== window.id);
		}
		this.#persist();
	}

	#persist() {
		WindowGroupBuilder.storeAllWindowGroups(this.windowGroups);
	}
}

export default new WindowGroupStore();

