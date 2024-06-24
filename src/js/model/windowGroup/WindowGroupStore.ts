import { observable, action, makeObservable } from "mobx";

import Window from "../window/Window";
import WindowGroup from "./WindowGroup";
import WindowGroupBuilder from "./WindowGroupBuilder";

class WindowGroupStore {

	windowGroups: WindowGroup[] = [];

	constructor() {
		makeObservable(this, {
			windowGroups: observable,
			setWindowGroups: action,
			addWindowToGroup: action,
		});
	}

	setWindowGroups = (windowGroups: WindowGroup[]) => this.windowGroups = windowGroups

	addWindowToGroup = (window: Window, groupName: string) => {
		return this.windowGroups.find(wg => wg.name === groupName)?.windows.push(window)
	}

	addWindowToNewGroup = (window: Window, groupName: string) => {
		this.windowGroups.push(
			WindowGroupBuilder.new(groupName)
				.withWindow(window)
				.build()
		);
	}
}

export default new WindowGroupStore();

