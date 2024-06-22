'use strict';

import Window from './model/Window';
import WindowBuilder from './WindowBuilder';
import _ from 'lodash';
import TabBuilder from './TabBuilder';

class WindowManager {
    private changeCallback: () => void = () => {};
    private _windows: Record<number, Window> = {};
    private state: "pending"|"finished" = "pending";

    constructor() {
        this.populate();

        // Set up callbacks
        browser.tabs.onCreated.addListener(this._onTabCreated);
        browser.tabs.onActivated.addListener(this._onTabActivated);
        browser.tabs.onUpdated.addListener(this._onTabUpdated);
        browser.tabs.onMoved.addListener(this._onTabMoved);
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
        let windowsList = await WindowBuilder.getAll()
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

    /**
     * Closes the given window.
     */
    async closeWindow(windowId: number): Promise<void> {
        delete this._windows[windowId];
        browser.windows.remove(windowId);
        this.changeCallback();
    }

////////////////////////////////////////////////////////////////////////
//                             CALLBACKS                              //
////////////////////////////////////////////////////////////////////////


    private _onTabCreated: Parameters<typeof browser.tabs.onCreated.addListener>[0]
    = async (browserTab) => {
        const tab = await TabBuilder.createFromBrowserTab(browserTab);
        if (tab.windowId) {
            this._windows[tab.windowId]?.addTab(tab);
        } else {
            console.log(`tab.windowId unexpectedly undefined: ${tab}`)
        }
    }

    private _onTabActivated: Parameters<typeof browser.tabs.onActivated.addListener>[0]
    = async (activeInfo) => {
        const window = this._windows[activeInfo.windowId];
        window.getActiveTab()?.setActive(false);
        window.getTabById(activeInfo.tabId)?.setActive(true);

        this.changeCallback();
    }

    private _onTabUpdated: Parameters<typeof browser.tabs.onUpdated.addListener>[0]
    = async (tabId, changeInfo, tab) => {
        if (tab.windowId) {
            this._windows[tab.windowId]?.updateTab(tab);
            this.changeCallback();
        }
    }

    /**
     * When a tab is dragged within the SAME window.
     */
    private _onTabMoved: Parameters<typeof browser.tabs.onMoved.addListener>[0]
    = async (tabId, {windowId, fromIndex, toIndex}) => {
        this._windows[windowId].moveTab(tabId, fromIndex, toIndex);
        this.changeCallback();
    }

    private _onTabRemoved: Parameters<typeof browser.tabs.onRemoved.addListener>[0]
    = async (tabId, removeInfo) => {
        this._windows[removeInfo.windowId].removeTab(tabId)
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
