'use strict';

import Window from './Window';
import WindowBuilder from './WindowBuilder';
import _ from 'lodash';
import BrowserWindowHooks from '../../appState/BrowserWindowHooks';

class WindowManager {
    // TODO move to WindowStore
    public windows: Record<number, Window> = {};
    private state: "pending"|"finished" = "pending";

    constructor() {
        this.populate();
        BrowserWindowHooks.engageHooks();
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
        this.windows = _.keyBy<Window>(windowsList, w => w.id);
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

    getWindowById(windowId: number): Window|undefined {
        return this.windows[windowId];
    }

    /**
     * Closes the given window.
     */
    async closeWindow(windowId: number): Promise<void> {
        delete this.windows[windowId];
        browser.windows.remove(windowId);
    }

}

export default new WindowManager();
