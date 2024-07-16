import { ArchivedTab, ArchivedWindow, ArchivedWindowGroup } from "./ArchivedWindowGroup";

const STORAGE_KEY = "archivedWindowGroups";

type ArchivedWindowGroupDataV1 = {
	"$schemaVersion": "v1",
	"$schemaName": "ArchivedWindowGroupsInternal",
	archivedWindowGroups: ArchivedWindowGroup[];
}
type ArchivedWindowGroupData = ArchivedWindowGroupDataV1;


type ArchivedWindowGroupExportV1 = {
	"$schemaVersion": "v1",
	"$schemaName": "ArchivedWindowGroups",
	archivedWindowGroups: ExportedWindowGroup[];
	favicons: Record<string, string>;
}
type ArchivedWindowGroupExport = ArchivedWindowGroupExportV1;

type ExportedWindowGroup = Omit<ArchivedWindowGroup, 'windows'> & {
	windows: ExportedWindow[];
}
type ExportedWindow = Omit<ArchivedWindow, 'tabs'> & {
	tabs: ExportedTab[];
}
type ExportedTab = Omit<ArchivedTab, 'favIconUrl'> & {
	favIconUrl: number|undefined;
}


export default class ArchivedWindowGroupDAO {

	static async getAll(): Promise<ArchivedWindowGroup[]> {
		let data = await browser.storage.local.get(STORAGE_KEY) as {
			[STORAGE_KEY]: ArchivedWindowGroupData;
		}

		return data[STORAGE_KEY]?.archivedWindowGroups ?? [];
	}

	/**
	 * Flattens an ArchivedWindowGroup.
	 *
	 * This method seems pretty redundant (it just copies properties over), but
	 * the input object has mobx hooks that prevent it from being serialized,
	 * so we copy props over to remove them.
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
				})),
			})),
			archiveDate: awg.archiveDate,
		}
	}

	static async storeAllArchivedWindowGroups(archivedWindowGroups: ArchivedWindowGroup[]) {
		await browser.storage.local.set({
			[STORAGE_KEY]: this.toStorageFormat(archivedWindowGroups)
		});
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
				.map((awg: ArchivedWindowGroup): ExportedWindowGroup => ({
					...awg,
					windows: awg.windows.map((w): ExportedWindow => ({
						...w,
						tabs: w.tabs.map((t): ExportedTab => {
							if (typeof t.favIconUrl == 'string') {
								let hash = cyrb53(t.favIconUrl);
								favicons[hash] = t.favIconUrl;
								return {
									...t,
									favIconUrl: hash,
								}
							} else {
								return t as ExportedTab
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
				.map((awg: ExportedWindowGroup): ArchivedWindowGroup => ({
					...awg,
					windows: awg.windows.map((w): ArchivedWindow => ({
						...w,
						tabs: w.tabs.map((t): ArchivedTab => ({
							...t,
							favIconUrl: typeof t.favIconUrl == 'number' ? archivedWindowGroups.favicons[t.favIconUrl] : t.favIconUrl,
						}))
					}))
				}))
		}
		throw new Error("Unsupported schema version: " + archivedWindowGroups["$schemaVersion"]);
	}

}


const cyrb53 = (str: string, seed = 0) => {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for(let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1  = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2  = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};
