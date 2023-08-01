'use strict';

import Window from './Window';
import _ from 'lodash';

class WindowManager {
    private changeCallback: () => void = () => {};
    private _windows: Record<number, Window> = {};
    private state: "pending"|"finished" = "pending";

    constructor() {
        this.populate();

        // Set up callbacks
        browser.tabs.onActivated.addListener(this._onTabActivated);
        browser.tabs.onRemoved.addListener(this._onTabRemoved);
    }

    private async populate() {
        this.state = "pending";
        let windowsList = await Window.getAll()
        this._windows = _.keyBy<Window>(windowsList, w => w.id);
        this.state = "finished";
    }

    /*
     * Returns a promise that will resolve when the tabs data is finished populating.
     */
    async waitForPopulated(): Promise<void> {
        let intervalId: ReturnType<typeof setInterval>;
        return new Promise((resolve) => {
            intervalId = setInterval(() => {
                if (this.state == "finished") {
                    clearInterval(intervalId);
                    resolve();
                }
            });
        });
    }

    private _onTabActivated: Parameters<typeof browser.tabs.onActivated.addListener>[0]
        = async (activeInfo) => {
            // tabsMap[activeInfo.tabId].active = true;
            // // This might not exist if the previous tab was just deleted
            // let prevTabId = activeInfo.previousTabId;
            // if (prevTabId && tabsMap[prevTabId]) {
            //     tabsMap[prevTabId].active = false
            // }

            await this.populate();
            this.changeCallback();
    }

    private _onTabRemoved: Parameters<typeof browser.tabs.onRemoved.addListener>[0]
        = async (tabId, removeInfo) => {
            // delete tabsMap[tabId]
            // windowsMap[removeInfo.windowId].removeTab(tabId);
            await this.populate();
            this.changeCallback();
    }

	/*
	 * Set the callback function. We'll call this after we get notified of tab changes.
	 */
	onTabChange(f: () => void) {
		this.changeCallback = f;
	}

    get windows() {
        return this._windows;
    }

}

export default new WindowManager();
