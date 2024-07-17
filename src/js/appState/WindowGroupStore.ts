import { observable, action, makeObservable } from "mobx";

import Window from "../model/window/Window";
import WindowGroup from "../model/windowGroup/WindowGroup";
import WindowGroupDAO from "../model/windowGroup/WindowGroupDAO";

class WindowGroupStore {

	windowGroups: WindowGroup[] = [];

	constructor() {
		makeObservable(this, {
			windowGroups: observable,
			addWindowToGroup: action,
			addWindowToNewGroup: action,
			renameWindowGroup: action,
			deleteWindowGroup: action,
		});

		WindowGroupDAO.getAll()
			.then(action(windowGroups => this.windowGroups = windowGroups));
	}

	// FIXME we should prevent the same window from being added twice
	addWindowToGroup = (window: Window, groupName: string) => {
		this.windowGroups.find(wg => wg.name === groupName)?.windows.push(window)
		window.addWindowGroup(groupName);
		this.#persist();
	}

	addWindowToNewGroup = (window: Window, groupName: string) => {
		this.windowGroups.push(
			WindowGroupDAO.new(groupName)
				.withWindow(window)
				.build()
		);
		this.#persist();
	}

	renameWindowGroup = (oldName: string, newName: string) => {
		let wg = this.windowGroups.find(wg => wg.name === oldName);
		if (wg) {
			wg.name = newName;
			this.#persist();
		} else {
			console.warn("Could not find window group to rename: ", oldName);
		}
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
		window.removeWindowGroup(groupName);
		this.#persist();
	}

	#persist() {
		WindowGroupDAO.storeAllWindowGroups(this.windowGroups);
	}
}

export default new WindowGroupStore();

