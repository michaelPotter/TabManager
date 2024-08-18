import { observable } from "mobx";

import { config } from "../../config";
import WindowGroupStore from "../../appState/WindowGroupStore";
import WindowStore from "../../appState/WindowStore";
import Window from "../window/Window";
import { WindowGroup, SerializedWindowGroup } from "./WindowGroup";

const STORAGE_KEY = "windowGroups";

interface _WGDAO {
	getAllGroups(): Promise<WindowGroup[]>;
	listGroups(): Promise<string[]>;
	createOrUpdateGroup(wg: WindowGroup): Promise<void>;
	deleteGroup(name: string): Promise<void>;
	getGroup(name: string): Promise<WindowGroup | undefined>;
	renameGroup(oldName: string, newName: string): Promise<void>;

	newWindowGroup(name: string): _windowGroupBuilder;

}

export default class CompositeWindowGroupDAO implements _WGDAO {
	dao: _WGDAO;

	constructor(wgStore: typeof WindowGroupStore) {
		if (config().useExternalStorage) {
			this.dao = new ExternalWindowGroupDAO();
		} else {
			this.dao = new LocalWindowGroupDAO(wgStore);
		}
	}

	async getAllGroups(): Promise<WindowGroup[]> {
		return this.dao.getAllGroups();
	}

    async listGroups(): Promise<string[]> {
		return this.dao.listGroups();
    }

    async createOrUpdateGroup(wg: WindowGroup): Promise<void> {
		return this.dao.createOrUpdateGroup(wg);
    }

    async deleteGroup(name: string): Promise<void> {
		return this.dao.deleteGroup(name);
    }

    async getGroup(name: string): Promise<WindowGroup | undefined> {
		return this.dao.getGroup(name);
    }

	async renameGroup(oldName: string, newName: string): Promise<void> {
		return this.dao.renameGroup(oldName, newName);
	}

	newWindowGroup(name: string): _windowGroupBuilder {
		return this.dao.newWindowGroup(name);
	}


}

////////////////////////////////////////////////////////////////////////
//                             DAO UTILS                              //
////////////////////////////////////////////////////////////////////////

class DAOUtils {
	static flattenWindowGroup(windowGroup: WindowGroup): SerializedWindowGroup {
		return {
			name: windowGroup.name,
			windows: windowGroup.windows.map(w => w.id),
		};
	}

	static inflateWindowGroup(wg: SerializedWindowGroup): WindowGroup {
		return new _windowGroupBuilder(wg.name)
			.withWindows(wg.windows.flatMap(wid => {
				let window = WindowStore.getWindowById(wid)
				if (window == undefined) {
					console.warn(`Window with id [${wid}] was expected in window group [${wg.name}] but not found`);
					return [];
				}
				window.addWindowGroup(wg.name);
				return [window];
			}))
			.build();
	}

	static async inflateWindowGroupSafe(wg: SerializedWindowGroup): Promise<WindowGroup> {
		await WindowStore.waitForPopulated();
		return this.inflateWindowGroup(wg);
	}

}

////////////////////////////////////////////////////////////////////////
//                             DAO IMPLS                              //
////////////////////////////////////////////////////////////////////////

class ExternalWindowGroupDAO implements _WGDAO {
	async getAllGroups(): Promise<WindowGroup[]> {
		let promises = (await this.listGroups()).map(name => this.getGroup(name));
		let all = await Promise.all(promises);
		return all.flatMap(wg => wg ? [wg] : []);
	}
    async listGroups(): Promise<string[]> {
		let res = await fetch(`${config().externalStorageUrl}/activeGroup`);
		if (!res.ok) {
			throw new Error("Error fetching active window groups from external storage: " + res.statusText);
		}
		return res.json();
    }
    async createOrUpdateGroup(wg: WindowGroup): Promise<void> {
		let serializedWindowGroup = DAOUtils.flattenWindowGroup(wg);
		let res = await fetch(`${config().externalStorageUrl}/activeGroup`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(serializedWindowGroup),
		});
		if (!res.ok) {
			throw new Error("Error creating or updating active window group: " + res.statusText);
		}
    }
    async deleteGroup(name: string): Promise<void> {
		let res = await fetch(`${config().externalStorageUrl}/activeGroup/${name}`, {
			method: 'DELETE',
		});
		if (!res.ok) {
			throw new Error("Error deleting active window group: " + res.statusText);
		}
    }
    async getGroup(name: string): Promise<WindowGroup | undefined> {
		let res = await fetch(`${config().externalStorageUrl}/activeGroup/${name}`);
		if (res.status === 404) {
			return undefined;
		} else if (!res.ok) {
			throw new Error("Error fetching archived window group: " + res.statusText);
		}
		let serializedWindowGroup = await res.json() as SerializedWindowGroup;
		return DAOUtils.inflateWindowGroupSafe(serializedWindowGroup);
    }
	async renameGroup(oldName: string, newName: string): Promise<void> {
		// Clunky way to do this, but it works
		let oldGroup = await this.getGroup(oldName);
		if (!oldGroup) {
			throw new Error("Group not found: " + oldName);
		}
		await this.deleteGroup(oldName);
		await this.createOrUpdateGroup(
			new _windowGroupBuilder(newName)
			.withWindows(oldGroup.windows)
			.build()
		);
	}

	newWindowGroup(name: string): _windowGroupBuilder {
		let builder = new _windowGroupBuilder(name);
		return builder;
	}

}



// This impl is a bit weird... historically we just stored everything in local
// storage as a big blob. But since the DAO interface is more granular, we need
// to implement that interface but still store the data in the same blob. Since
// the old blob was based on the data stored in the store, we'll actually just
// use that data directly too. It's basically the same as how it used to work,
// just with the granular interface in the middle. Feels a bit weird and
// circular but it should work.
class LocalWindowGroupDAO implements _WGDAO {
	wgStore: typeof WindowGroupStore;
	constructor(wgStore: typeof WindowGroupStore) {
		this.wgStore = wgStore;
	}

	async getAllGroups(): Promise<WindowGroup[]> {
		let data = await LocalWindowGroupDAO.getAll();
		// return data[STORAGE_KEY]?.archivedWindowGroups ?? [];
		return data;
	}
    async listGroups(): Promise<string[]> {
		return this.wgStore.windowGroups.map(wg => wg.name);
    }
    async createOrUpdateGroup(wg: WindowGroup): Promise<void> {
		await this.storeAll(this.wgStore.windowGroups);
    }
    async deleteGroup(name: string): Promise<void> {
		await this.storeAll(this.wgStore.windowGroups);
    }
    async getGroup(name: string): Promise<WindowGroup | undefined> {
		return this.wgStore.windowGroups.find(wg => wg.name === name);
    }
	async renameGroup(oldName: string, newName: string): Promise<void> {
		await this.storeAll(this.wgStore.windowGroups);
	}

	newWindowGroup(name: string): _windowGroupBuilder {
		let builder = new _windowGroupBuilder(name);
		return builder;
	}

	private static async getAll(): Promise<WindowGroup[]> {
		let data = await browser.storage.local.get(STORAGE_KEY);

		// Make sure that WindowStore is populated before we try to build window groups
		await WindowStore.waitForPopulated();
		let windowGroups: WindowGroup[] = data.windowGroups?.map(DAOUtils.inflateWindowGroup) ?? [];

		return windowGroups
	}
	private async storeAll(windowGroups: WindowGroup[]) {
		await browser.storage.local.set({
			[STORAGE_KEY]: windowGroups.map(DAOUtils.flattenWindowGroup)
		});
	}
}
////////////////////////////////////////////////////////////////////////
//                               UTILS                                //
////////////////////////////////////////////////////////////////////////


/**
 * An actual builder pattern
 */
// TODO persist somehow on creation?
class _windowGroupBuilder {
	private windowGroup: WindowGroup;

	constructor(name: string) {
		this.windowGroup = observable({
			name: name,
			windows: [] as Window[],
		});
	}

	withWindows(windows: Window[]): _windowGroupBuilder {
		windows.forEach(w => {
			this.windowGroup.windows.push(w);
		});
		return this;
	}

	build(): WindowGroup {
		return this.windowGroup;
	}
}
