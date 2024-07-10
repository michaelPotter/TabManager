import { ArchivedWindowGroup } from "./ArchivedWindowGroup";

const STORAGE_KEY = "archivedWindowGroups";

export default class ArchivedWindowGroupDAO {

	static async getAll(): Promise<ArchivedWindowGroup[]> {
		let data = await browser.storage.local.get(STORAGE_KEY);

		return data.archivedWindowGroups ?? [];
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
			[STORAGE_KEY]: archivedWindowGroups.map(this.flattenAWG)
		});
	}
	
}
