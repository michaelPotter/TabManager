import WindowGroupStore from "../../appState/WindowGroupStore";
import WindowStore from "../../appState/WindowStore";
import { ArchivedWindowGroup } from "../archivedWindowGroup/ArchivedWindowGroup";
import ArchivedWindowGroupStore from "../archivedWindowGroup/ArchivedWindowGroupStore";
import WindowGroup from "./WindowGroup";
import type WindowModel from '../window/Window';

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

const allowed_urls = /^http(s)?/

// TODO have all the tabs start as disabled, so they don't all load at once.
export async function unarchiveWindowGroup(awg: ArchivedWindowGroup) {
	let promises = awg.windows.map(async w => {

		// Create the new window
		let win = await WindowStore.createWindow({
			name: w.name,
			tabs: w.tabs.map(t => t.url)
				.filter(t => t.match(allowed_urls))
				,
			windowGroup: awg.name,
		})

		// Manually create placeholders for tabs we don't have perms to create
		// TODO right now this supports newtabs, but to support other things, we should create a new extension page,
		// e.g. faketab.jsx that we can open instead. This placeholder tab page should have a message explaining why the
		// real url can't be opened, and a clickable link to the real url.
		if (win?.id) {
			w.tabs.forEach((t, i) => {
				if (t.url.startsWith("about:newtab")) {
					browser.tabs.create({
						windowId: (win as WindowModel).id,
						index: i,
					});
				}
			});
		}

		return win ? [win] : [];
	});
	let windows = (await Promise.all(promises)).flat();
	WindowGroupStore.addWindowsToNewGroup(windows, awg.name);
	ArchivedWindowGroupStore.deleteAWG(awg.name);
}
