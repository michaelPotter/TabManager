/**
 * Class to handle the extension badge.
 *
 * The extension badge shows how many tabs are currently open.
 */

export default class Badge {
	constructor() {
		this.n = -1
		this.recount()
		browser.browserAction.setBadgeBackgroundColor({"color":"teal"})
	}

	/**
	 * Updates the text of the badge
	 */
	refresh() {
		browser.browserAction.setBadgeText({"text": this.n.toString()});
	}

	/**
	 * Recounts the number of tabs and updates the badge.
	 *
	 * Use this if the count becomes out of sync somehow. This operation is
	 * more expensive than just keeping track; use sparingly. Runs the optional
	 * callback with the number of open tabs.
	 */
	async recount() {
		let tabs = await browser.tabs.query({});
		this.n = tabs.length
		this.refresh();
	}

	/**
	 * Add {int} n to the count. May be negative to subtract.
	 */
	add(n=1) {
		this.n += n;
		this.refresh()
	}

	/**
	 * Remove {int} n from the count. May be negative to add.
	 */
	remove(n=1) { this.add(0 - n); }

	inc() { this.add(1) };
	dec() { this.remove(1) };

}
