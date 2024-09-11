import WindowGroupStore from "../../appState/WindowGroupStore";
import WindowStore from "../../appState/WindowStore";
import { ArchivedWindowGroup } from "../archivedWindowGroup/ArchivedWindowGroup";
import ArchivedWindowGroupStore from "../archivedWindowGroup/ArchivedWindowGroupStore";
import type { WindowGroup } from "./WindowGroup";
import type WindowModel from '../window/Window';
import PopupStore from "../../appState/PopupStore";
import { action } from "mobx";

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
				active: t.active,
			})),
		})),
	}
}

export function archiveWindowGroup(wg: WindowGroup) {
	// FIXME confirm that the current window is NOT in the group to be archived... that results in a partial archive
	let awg = createWindowGroupArchive(wg);
	ArchivedWindowGroupStore.addAWG(awg)
		.then(action(() => {
			wg.windows.forEach(w => {
				WindowStore.closeWindow(w.id);
			});
		}))
		.then(() => WindowGroupStore.deleteWindowGroup(wg.name))
		.catch(e => {
			PopupStore.setErrorMessage(`Failed to archive window group: ${e}`);
		})
		;
}

const allowed_urls = /^http(s)?/

export async function unarchiveWindowGroup(awg: ArchivedWindowGroup) {
	let promises = awg.windows.map(async w => {

		// Create the new window
		let win = await WindowStore.createWindow({
			name: w.name,
			// Start with a newtab
			tabs: [],
			windowGroup: awg.name,
		})

		// Manually create placeholders for tabs we don't have perms to create
		// TODO right now this supports newtabs, but to support other things, we should create a new extension page,
		// e.g. faketab.jsx that we can open instead. This placeholder tab page should have a message explaining why the
		// real url can't be opened, and a clickable link to the real url.
		if (win?.id) {
			let placeholderTab = (await browser.tabs.query({windowId: win.id}))[0];
			w.tabs.forEach((t, i) => {
				if (t.url.startsWith("about:newtab")) {
					browser.tabs.create({
						windowId: (win as WindowModel).id,
						active: t.active,
						index: i,
					});
				} else {
					browser.tabs.create({
						windowId: (win as WindowModel).id,
						url: t.url,
						active: t.active,
						discarded: ! t.active,
						title: t.active ? undefined : t.title,
						index: i,
					});
				}
			});

			// Remove the default tab from the new window.
			if (placeholderTab.id) {
				await browser.tabs.remove(placeholderTab.id);
			}
		}

		return win ? [win] : [];
	});
	let windows = (await Promise.all(promises)).flat();
	WindowGroupStore.addWindowsToNewGroup(windows, awg.name);
	ArchivedWindowGroupStore.deleteAWG(awg.name);
}
