import { ArchivedWindowGroup } from "./ArchivedWindowGroup";

const STORAGE_KEY = "archivedWindowGroups";

type ArchivedWindowGroupDataV1 = {
	"$schemaVersion": "v1",
	archivedWindowGroups: ArchivedWindowGroup[];
}

type ArchivedWindowGroupData = ArchivedWindowGroupDataV1;

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
			archivedWindowGroups: archivedWindowGroups.map(this.flattenAWG)
		}
		return data
	}

	static toExportFormat(archivedWindowGroups: ArchivedWindowGroup[]): ArchivedWindowGroupData {
		let data = this.toStorageFormat(archivedWindowGroups);
		// Delete favicons cuz they take up a lot of space and aren't important
		data.archivedWindowGroups.forEach(awg => {
			awg.windows.forEach(w => {
				w.tabs.forEach(t => {
					delete t.favIconUrl;
				})
			});
		});
		return data
	}

	static fromExportFormat(archivedWindowGroups: ArchivedWindowGroupData): ArchivedWindowGroup[] {
		if (archivedWindowGroups["$schemaVersion"] === "v1") {
			return archivedWindowGroups.archivedWindowGroups;
		}
		throw new Error("Unsupported schema version: " + archivedWindowGroups["$schemaVersion"]);
	}
	
}
