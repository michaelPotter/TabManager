import WindowStore from "../../appState/WindowStore";
import Window from "../window/Window";
import WindowGroup, { SerializedWindowGroup } from "./WindowGroup";

export default class WindowGroupBuilder {

	static async getAll(): Promise<WindowGroup[]> {
		let data = await browser.storage.local.get("windowGroups");

		// Make sure that WindowStore is populated before we try to build window groups
		await WindowStore.waitForPopulated();
		let windowGroups: WindowGroup[] = data.windowGroups.map((wg: SerializedWindowGroup) => {
			return {
				name: wg.name,
				windows: wg.windows.flatMap(wid => {
					let window = WindowStore.getWindowById(wid)
					if (window == undefined) {
						console.warn(`Window with id [${wid}] was expected in window group [${wg.name}] but not found`);
						return [];
					}
					return [window];
				})
			}
		});
		return windowGroups
	}

	static new(name: string): _windowGroupBuilder {
		let builder = new _windowGroupBuilder(name);
		return builder;
	}

	static flattenWindowGroup(windowGroup: WindowGroup): SerializedWindowGroup {
		return {
			name: windowGroup.name,
			windows: windowGroup.windows.map(w => w.id),
		};
	}

	static async storeAllWindowGroups(windowGroups: WindowGroup[]) {
		await browser.storage.local.set({
			windowGroups: windowGroups.map(WindowGroupBuilder.flattenWindowGroup)
		});
	}
	
}

/**
 * An actual builder pattern
 */
// TODO persist somehow on creation?
class _windowGroupBuilder {
	private windowGroup: WindowGroup;

	constructor(name: string) {
		this.windowGroup = new WindowGroup();
		this.windowGroup.name = name;
	}

	withWindow(window: Window): _windowGroupBuilder {
		this.windowGroup.windows.push(window);
		return this;
	}

	build(): WindowGroup {
		return this.windowGroup;
	}
}
