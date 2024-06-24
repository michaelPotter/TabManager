import Window from "../window/Window";
import WindowGroup from "./WindowGroup";

export default class WindowGroupBuilder {

	static async getAll(): Promise<WindowGroup[]> {
		// TODO implemente persistence/hydration
		// TODO something still needs to call this... not sure what
		let data = await browser.storage.local.get("windowGroups");
		return [];
	}

	static new(name: string): _windowGroupBuilder {
		let builder = new _windowGroupBuilder(name);
		return builder;
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
