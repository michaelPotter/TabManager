import { observable, action, makeObservable } from "mobx";

import Window from "../model/window/Window";
import WindowGroup from "../model/windowGroup/WindowGroup";
import WindowGroupDAO from "../model/windowGroup/WindowGroupDAO";

class WindowGroupStore {

	windowGroups: WindowGroup[] = [];

	constructor() {
		makeObservable(this, {
			windowGroups: observable,
			addWindowsToGroup: action,
			addWindowsToNewGroup: action,
			renameWindowGroup: action,
			deleteWindowGroup: action,
		});

		WindowGroupDAO.getAll()
			.then(action(windowGroups => this.windowGroups = windowGroups));
	}

	createWindowGroup = (groupName: string) => {
		let windowGroup = WindowGroupDAO.new(groupName).build();
		this.windowGroups.unshift(windowGroup);
		this._moveGroupToTop(groupName);
		this.#persist();
		return windowGroup;
	}

	// FIXME we should prevent the same window from being added twice
	addWindowsToGroup = (windows: Window[], groupName: string) => {
		windows.forEach(w => {
			this.windowGroups.find(wg => wg.name === groupName)?.windows.push(w)
			w.addWindowGroup(groupName);
		});
		this._moveGroupToTop(groupName);
		this.#persist();
	}

	addWindowsToNewGroup = (windows: Window[], groupName: string) => {
		this.windowGroups.unshift(
			WindowGroupDAO.new(groupName)
				.withWindows(windows)
				.build()
		);
		windows.forEach(w => {
			w.addWindowGroup(groupName);
		});
		this.#persist();
	}

	renameWindowGroup = (oldName: string, newName: string) => {
		let wg = this.windowGroups.find(wg => wg.name === oldName);
		if (wg) {
			wg.name = newName;
			wg.windows.forEach(w => w.renameWindowGroup(oldName, newName));
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

	_moveGroupToTop(groupName: string) {
		const group = this.windowGroups.find(wg => wg.name === groupName);
		if (group) {
			this.windowGroups = this.windowGroups.filter(wg => wg.name !== groupName);
			this.windowGroups.unshift(group);
		}
	}

	#persist() {
		WindowGroupDAO.storeAllWindowGroups(this.windowGroups);
	}
}

export default new WindowGroupStore();

