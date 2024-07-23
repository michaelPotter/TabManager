import WindowGroupStore from "../../appState/WindowGroupStore";
import WindowStore from "../../appState/WindowStore";
import { ArchivedWindowGroup } from "../archivedWindowGroup/ArchivedWindowGroup";
import ArchivedWindowGroupStore from "../archivedWindowGroup/ArchivedWindowGroupStore";
import WindowGroup from "./WindowGroup";

function createWindowGroupArchive(wg: WindowGroup): ArchivedWindowGroup {
	return {
		name: wg.name,
		archiveDate: new Date(),
		windows: wg.windows.map(w => ({
			name: w.name,
			tabs: w.tabs.map(t => ({
				title: t.title ?? t.url ?? "",
				favIconUrl: t.favIconUrl,
				url: t.url ?? (() => { throw new Error("Cannot archive a tab without a url"); })(),
			})),
		})),
	}
}

export function archiveWindowGroup(wg: WindowGroup) {
	let awg = createWindowGroupArchive(wg);
	ArchivedWindowGroupStore.addAWG(awg);
	wg.windows.forEach(w => {
		WindowStore.closeWindow(w.id);
	});
	WindowGroupStore.deleteWindowGroup(wg.name);
}

export async function unarchiveWindowGroup(awg: ArchivedWindowGroup) {
	let promises = awg.windows.map(w =>
		WindowStore.createWindow({
			name: w.name,
			tabs: w.tabs.map(t => t.url),
			windowGroup: awg.name,
		}).then(w => w ? [w] : [])
	);
	let windows = await Promise.all(promises);
	WindowGroupStore.addWindowsToNewGroup(windows.flat(), awg.name);
	ArchivedWindowGroupStore.deleteAWG(awg.name);
}
