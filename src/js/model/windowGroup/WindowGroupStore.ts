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
			_init: action,
		});

		this._init();
	}

	async _init() {
		await WindowManager.waitForPopulated();
		this.windowGroups = await WindowGroupBuilder.getAll();
	}

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

	#persist() {
		WindowGroupBuilder.storeAllWindowGroups(this.windowGroups);
	}
}

export default new WindowGroupStore();

