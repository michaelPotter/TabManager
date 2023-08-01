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

    /**
     * Populates the internal list of tabs from the tabs api as well as internal storage.
     * Should ONLY be called on creation, NOT on re-renders or data change. We
     * should manually update our in-mem data as needed using browser callbacks.
     *
     */
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

    private _onTabCreated: Parameters<typeof browser.tabs.onActivated.addListener>[0]
    = async (activeInfo) => {
        activeInfo.windowId
        activeInfo.tabId
    }

    private _onTabActivated: Parameters<typeof browser.tabs.onActivated.addListener>[0]
    = async (activeInfo) => {
        const window = this._windows[activeInfo.windowId];
        window.getActiveTab()?.setActive(false);
        window.getTabById(activeInfo.tabId)?.setActive(true);

            this.changeCallback();
    }

    private _onTabRemoved: Parameters<typeof browser.tabs.onRemoved.addListener>[0]
    = async (tabId, removeInfo) => {
        this._windows[removeInfo.windowId].removeTab(tabId)
        console.log(`this._windows[removeInfo.windowId]: `, this._windows[removeInfo.windowId])  // TODO DELETE ME
        this.changeCallback();
    }

    /**
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
