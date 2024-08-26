import { observable, action, makeObservable } from "mobx";
import { ComponentState } from "react";

import Window from "../model/window/Window";
import { WindowGroup } from "../model/windowGroup/WindowGroup";
import WindowGroupDAO from "../model/windowGroup/WindowGroupDAO";

class WindowGroupStore {

	windowGroups: WindowGroup[] = [];
	dao: WindowGroupDAO;
	state: ComponentState = "init";

	constructor() {
		makeObservable(this, {
			windowGroups: observable,
			addWindowsToGroup: action,
			addWindowsToNewGroup: action,
			renameWindowGroup: action,
			deleteWindowGroup: action,
		});

		this.dao = new WindowGroupDAO(this);
		this.dao.getAllGroups()
			.then(action(windowGroups => {
				this.windowGroups = windowGroups
				window.localStorage.setItem('hasLoaded', 'true');
				this.state = "loaded";
			}));
	}

	createWindowGroup = (groupName: string) => {
		let windowGroup = this.dao.newWindowGroup(groupName).build();
		this.windowGroups.unshift(windowGroup);
		this._moveGroupToTop(groupName);
		this.dao.createOrUpdateGroup(windowGroup);
		return windowGroup;
	}

	// FIXME we should prevent the same window from being added twice
	addWindowsToGroup = (windows: Window[], groupName: string) => {
		let wg = this._findByName(groupName);
		if (wg) {
			wg.windows.push(...windows);
			windows.forEach(w => {
				w.addWindowGroup(groupName);
			});
			this._moveGroupToTop(groupName);
			this.dao.createOrUpdateGroup(wg);
		}
	}

	addWindowsToNewGroup = (windows: Window[], groupName: string) => {
		this.windowGroups.unshift(
			this.dao.newWindowGroup(groupName)
				.withWindows(windows)
				.build()
		);
		windows.forEach(w => {
			w.addWindowGroup(groupName);
		});
		this.dao.createOrUpdateGroup(this.windowGroups[0]);
	}

	renameWindowGroup = (oldName: string, newName: string) => {
		let wg = this._findByName(oldName);
		if (wg) {
			wg.name = newName;
			wg.windows.forEach(w => w.renameWindowGroup(oldName, newName));
			this.dao.renameGroup(oldName, newName);
		} else {
			console.warn("Could not find window group to rename: ", oldName);
		}
	}

	deleteWindowGroup = (groupName: string) => {
		this.windowGroups = this.windowGroups.filter(wg => wg.name !== groupName);
		this.dao.deleteGroup(groupName);
	}

	removeWindowFromGroup = (window: Window, groupName: string) => {
		let wg = this._findByName(groupName);
		if (wg) {
			wg.windows = wg.windows.filter(w => w.id !== window.id);
			this.dao.createOrUpdateGroup(wg);
		}
		window.removeWindowGroup(groupName);
	}

	_moveGroupToTop(groupName: string) {
		const group = this.windowGroups.find(wg => wg.name === groupName);
		if (group) {
			this.windowGroups = this.windowGroups.filter(wg => wg.name !== groupName);
			this.windowGroups.unshift(group);
		}
	}

	_findByName(groupName: string) {
		return this.windowGroups.find(wg => wg.name === groupName);
	}

}

export default new WindowGroupStore();

