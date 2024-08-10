import { cyrb53 } from "../../util";
import { ArchivedTab, ArchivedWindow, ArchivedWindowGroup, ArchivedWindowGroupData } from "./ArchivedWindowGroup";
import { ArchivedWindowGroupExport, ExportedArchivedWindowGroup, ExportedTab, ExportedWindow } from "./ExportedArchivedWindowGroup";

const STORAGE_KEY = "archivedWindowGroups";
// TODO this should have a setting or something. Maybe we should show an error in the UI when we can't contact the server? idk
// FIXME: there's an issue - we can't persist the whole object all at once so will have to break it down into chunks before using this strategy...
const USE_EXTERNAL_STORAGE = false;
const externalStorageUrl = "http://localhost:7435";

let hasCheckedLocalToExternalMigration = false;

type KeyedArchiveData = {
	[STORAGE_KEY]?: ArchivedWindowGroupData;
}
export default class ArchivedWindowGroupDAO {

	static async getAll(): Promise<ArchivedWindowGroup[]> {
		let data: KeyedArchiveData;
		if (USE_EXTERNAL_STORAGE) {
			// Run this on the read, so that we migrate on startup, if it hasn't been done yet.
			this.migrateLocalToExternal();
			data = await this.getAllExternal();
		} else {
			data = await this.getAllLocal();
		}

		return data[STORAGE_KEY]?.archivedWindowGroups ?? [];
	}

	private static async getAllLocal(): Promise<KeyedArchiveData> {
		return await browser.storage.local.get(STORAGE_KEY) as KeyedArchiveData;
	}

	private static async getAllExternal(): Promise<KeyedArchiveData> {
		let res = await fetch(`${externalStorageUrl}/key/${STORAGE_KEY}`);
		if (res.status === 404) {
			return {};
		} else if (!res.ok) {
			console.warn("Error fetching archived window groups from external storage:", res.statusText);
			return {};
		}
		return await res.json();
	}

	static async storeAllArchivedWindowGroups(archivedWindowGroups: ArchivedWindowGroup[]) {
		if (USE_EXTERNAL_STORAGE) {
			await this.storeAllExternal(archivedWindowGroups);
		} else {
			await this.storeAllLocal(archivedWindowGroups);
		}
	}

	private static async storeAllLocal(archivedWindowGroups: ArchivedWindowGroup[]) {
		await browser.storage.local.set({
			[STORAGE_KEY]: this.toStorageFormat(archivedWindowGroups)
		});
	}
	private static async storeAllExternal(archivedWindowGroups: ArchivedWindowGroup[]) {
		await fetch(`${externalStorageUrl}/key/${STORAGE_KEY}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(this.toStorageFormat(archivedWindowGroups)),
		});
	}

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

	static toExportFormat(archivedWindowGroups: ArchivedWindowGroup[]): ArchivedWindowGroupExport {
		let favicons: Record<number, string> = {}
		let data: ArchivedWindowGroupExport = {
			"$schemaVersion": "v1",
			"$schemaName": "ArchivedWindowGroups",
			archivedWindowGroups: archivedWindowGroups
				.map(this.flattenAWG)
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

	private static async migrateLocalToExternal() {
		if (hasCheckedLocalToExternalMigration) {
			return;
		}
		hasCheckedLocalToExternalMigration = true;

		let localData = await this.getAllLocal();
		if (localData?.[STORAGE_KEY]) {
			console.log("migrating local data to external");
			await this.storeAllExternal(localData[STORAGE_KEY].archivedWindowGroups);
			browser.storage.local.remove(STORAGE_KEY);
		} else {
			// console.log(`no local data`);
		}
	}

}
