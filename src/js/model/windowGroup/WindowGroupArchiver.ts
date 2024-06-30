import { ArchivedWindowGroup } from "../archivedWindowGroup/ArchivedWindowGroup";
import WindowGroup from "./WindowGroup";

export function createWindowGroupArchive(wg: WindowGroup): ArchivedWindowGroup {
	return {
		name: wg.name,
		archiveDate: new Date(),
		windows: wg.windows.map(w => ({
			name: w.name,
			tabs: w.tabs.map(t => ({
				title: t.title ?? t.url ?? "",
				url: t.url ?? (() => { throw new Error("Cannot archive a tab without a url"); })(),
			})),
		})),
	}
}
