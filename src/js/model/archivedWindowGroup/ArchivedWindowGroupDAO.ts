import { cyrb53 } from "../../util";
import { config } from "../../config";
import { ArchivedTab, ArchivedWindow, ArchivedWindowGroup, ArchivedWindowGroupData } from "./ArchivedWindowGroup";
import type ArchivedWindowGroupStore from "./ArchivedWindowGroupStore";
import { ArchivedWindowGroupExport, ExportedArchivedWindowGroup, ExportedTab, ExportedWindow } from "./ExportedArchivedWindowGroup";

const STORAGE_KEY = "archivedWindowGroups";
// TODO external storage should be configurable somehow. Maybe we should show
// an error in the UI when we can't contact the server? idk

let hasCheckedLocalToExternalMigration = false;

type KeyedArchiveData = {
	[STORAGE_KEY]?: ArchivedWindowGroupData;
}

interface _AWGDAO {
	getAllGroups(): Promise<ArchivedWindowGroup[]>;
	listGroups(): Promise<string[]>;
	createOrUpdateGroup(awg: ArchivedWindowGroup): Promise<void>;
	deleteGroup(name: string): Promise<void>;
	getGroup(name: string): Promise<ArchivedWindowGroup | undefined>;
	renameGroup(oldName: string, newName: string): Promise<void>;
}

// Handles persisting the data. 
// Persists to local storage or external storage, depending on USE_EXTERNAL_STORAGE
export default class ArchivedWindowGroupDAO implements _AWGDAO {

	dao: _AWGDAO;

	constructor(awgStore: typeof ArchivedWindowGroupStore) {
		if (config().useExternalStorage) {
			this.dao = new ExternalWindowGroupDAO();
			this.migrateLocalToExternal(awgStore);
		} else {
			this.dao = new LocalArchiveWindowGroupDAO(awgStore);
		}
	}

	async getAllGroups(): Promise<ArchivedWindowGroup[]> {
		return this.dao.getAllGroups();
	}

    async listGroups(): Promise<string[]> {
		return this.dao.listGroups();
    }

    async createOrUpdateGroup(awg: ArchivedWindowGroup): Promise<void> {
		return this.dao.createOrUpdateGroup(awg);
    }

    async deleteGroup(name: string): Promise<void> {
		return this.dao.deleteGroup(name);
    }

    async getGroup(name: string): Promise<ArchivedWindowGroup | undefined> {
		return this.dao.getGroup(name);
    }

	async renameGroup(oldName: string, newName: string): Promise<void> {
		return this.dao.renameGroup(oldName, newName);
	}

	static toExportFormat(archivedWindowGroups: ArchivedWindowGroup[]): ArchivedWindowGroupExport {
		let favicons: Record<number, string> = {}
		let data: ArchivedWindowGroupExport = {
			"$schemaVersion": "v1",
			"$schemaName": "ArchivedWindowGroups",
			archivedWindowGroups: archivedWindowGroups
				.map(DAOUtils.flattenAWG)
				.map((awg: ArchivedWindowGroup): ExportedArchivedWindowGroup => ({
					...awg,
					windows: awg.windows.map((w): ExportedWindow => ({
						name: w.name,
						activeTabIndex: w.tabs.findIndex(t => t.active),
						tabs: w.tabs.map((t): ExportedTab => {
							if (typeof t.favIconUrl == 'string') {
								let hash = cyrb53(t.favIconUrl);
								favicons[hash] = t.favIconUrl;
								return {
									title: t.title,
									url: t.url,
									favIconUrl: hash,
								}
							} else {
								return {
									title: t.title,
									url: t.url,
									favIconUrl: undefined,
								}
							}
						})
					}))
				})),
			favicons: favicons,
		}

		return data
	}

	static fromExportFormat(archivedWindowGroups: ArchivedWindowGroupExport): ArchivedWindowGroup[] {
		if (archivedWindowGroups["$schemaVersion"] === "v1") {
			return archivedWindowGroups.archivedWindowGroups
				.map((awg: ExportedArchivedWindowGroup): ArchivedWindowGroup => ({
					...awg,
					windows: awg.windows.map((w): ArchivedWindow => ({
						...w,
						tabs: w.tabs.map((t, i): ArchivedTab => ({
							title: t.title,
							url: t.url,
							favIconUrl: typeof t.favIconUrl == 'number' ? archivedWindowGroups.favicons[t.favIconUrl] : t.favIconUrl,
							active: w.activeTabIndex === i,
						}))
					}))
				}))
		}
		throw new Error("Unsupported schema version: " + archivedWindowGroups["$schemaVersion"]);
	}

	private async migrateLocalToExternal(awgStore: typeof ArchivedWindowGroupStore) {
		if (hasCheckedLocalToExternalMigration) {
			return;
		}
		hasCheckedLocalToExternalMigration = true;

		let localDAO = new LocalArchiveWindowGroupDAO(awgStore);
		let localData = await localDAO.getAllGroups();
		if (localData.length > 0) {
			console.log("migrating local data to external");
			for (let awg of localData) {
				await this.createOrUpdateGroup(awg);
			}
			// Wait until we've successfully imported them all to delete any
			for (let awg of localData) {
				await localDAO.deleteGroup(awg.name);
			}
		} else {
			// console.log(`no local data`);
		}
	}

}

////////////////////////////////////////////////////////////////////////
//                             DAO UTILS                              //
////////////////////////////////////////////////////////////////////////

class DAOUtils {

	/**
	 * Flattens an ArchivedWindowGroup.
	 *
	 * This method seems pretty redundant (it just copies properties over), but
	 * the input object has mobx hooks that prevent it from being serialized,
	 * so we copy props over to remove them.
	 * TODO consider using mobx toJS() instead?
	 */
	static flattenAWG(awg: ArchivedWindowGroup): ArchivedWindowGroup {
		return {
			name: awg.name,
			windows: awg.windows.map(w => ({
				name: w.name,
				tabs: w.tabs.map(t => ({
					title: t.title,
					favIconUrl: t.favIconUrl,
					url: t.url,
					active: t.active,
				})),
			})),
			archiveDate: awg.archiveDate,
		}
	}

	static toStorageFormat(archivedWindowGroups: ArchivedWindowGroup[]): ArchivedWindowGroupData {
		let data: ArchivedWindowGroupData = {
			"$schemaVersion": "v1",
			"$schemaName": "ArchivedWindowGroupsInternal",
			archivedWindowGroups: archivedWindowGroups.map(this.flattenAWG)
		}
		return data
	}

}

////////////////////////////////////////////////////////////////////////
//                             DAO IMPLS                              //
////////////////////////////////////////////////////////////////////////

class ExternalWindowGroupDAO implements _AWGDAO {
	async getAllGroups(): Promise<ArchivedWindowGroup[]> {
		let promises = (await this.listGroups()).map(name => this.getGroup(name));
		let all = await Promise.all(promises);
		return all.flatMap(awg => awg ? [awg] : []);
	}
    async listGroups(): Promise<string[]> {
		let res = await fetch(`${config().externalStorageUrl}/archiveGroup`);
		if (!res.ok) {
			throw new Error("Error fetching archived window groups from external storage: " + res.statusText);
		}
		return res.json();
    }
    async createOrUpdateGroup(awg: ArchivedWindowGroup): Promise<void> {
		let res = await fetch(`${config().externalStorageUrl}/archiveGroup`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(awg),
		});
		if (!res.ok) {
			throw new Error("Error creating or updating archived window group: " + res.statusText);
		}
    }
    async deleteGroup(name: string): Promise<void> {
		let res = await fetch(`${config().externalStorageUrl}/archiveGroup/${name}`, {
			method: 'DELETE',
		});
		if (!res.ok) {
			throw new Error("Error deleting archived window group: " + res.statusText);
		}
    }
    async getGroup(name: string): Promise<ArchivedWindowGroup | undefined> {
		let res = await fetch(`${config().externalStorageUrl}/archiveGroup/${name}`);
		if (res.status === 404) {
			return undefined;
		} else if (!res.ok) {
			throw new Error("Error fetching archived window group: " + res.statusText);
		}
		return res.json();
    }
	async renameGroup(oldName: string, newName: string): Promise<void> {
		// Clunky way to do this, but it works
		let oldGroup = await this.getGroup(oldName);
		if (!oldGroup) {
			throw new Error("Group not found: " + oldName);
		}
		await this.deleteGroup(oldName);
		await this.createOrUpdateGroup({
			...oldGroup,
			name: newName,
		});
	}
}

// This impl is a bit weird... historically we just stored everything in local
// storage as a big blob. But since the DAO interface is more granular, we need
// to implement that interface but still store the data in the same blob. Since
// the old blob was based on the data stored in the store, we'll actually just
// use that data directly too. It's basically the same as how it used to work,
// just with the granular interface in the middle. Feels a bit weird and
// circular but it should work.
class LocalArchiveWindowGroupDAO implements _AWGDAO {
	awgStore: typeof ArchivedWindowGroupStore;
	constructor(awgStore: typeof ArchivedWindowGroupStore) {
		this.awgStore = awgStore;
	}

	async getAllGroups(): Promise<ArchivedWindowGroup[]> {
		let data = await LocalArchiveWindowGroupDAO.getAll();
		return data[STORAGE_KEY]?.archivedWindowGroups ?? [];
	}
    async listGroups(): Promise<string[]> {
		return this.awgStore.archivedWindowGroups.map(awg => awg.name);
    }
    async createOrUpdateGroup(awg: ArchivedWindowGroup): Promise<void> {
		await this.storeAll(this.awgStore.archivedWindowGroups);
    }
    async deleteGroup(name: string): Promise<void> {
		await this.storeAll(this.awgStore.archivedWindowGroups);
    }
    async getGroup(name: string): Promise<ArchivedWindowGroup | undefined> {
		return this.awgStore.archivedWindowGroups.find(awg => awg.name === name);
    }
	async renameGroup(oldName: string, newName: string): Promise<void> {
		await this.storeAll(this.awgStore.archivedWindowGroups);
	}

	private static async getAll(): Promise<KeyedArchiveData> {
		return await browser.storage.local.get(STORAGE_KEY) as KeyedArchiveData;
	}
	private async storeAll(archivedWindowGroups: ArchivedWindowGroup[]) {
		await browser.storage.local.set({
			[STORAGE_KEY]: DAOUtils.toStorageFormat(archivedWindowGroups)
		});
	}
}
