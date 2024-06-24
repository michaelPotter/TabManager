/*
 * WindowBuilder.ts
 *
 * Methods for creating Windows.
 */
'use strict';

import _ from 'lodash';
import TabBuilder from './model/tab/TabBuilder';
import Window from './model/Window';

// This is the extra data we can't get from the browser api.
declare type WindowData = {
    id?: number,
    last_accessed?: number,
};

export default class WindowBuilder {
    /**
     * Get all Windows
     *
     * Creates all Windows.
     * Storage data is used, if found.
     */
    static async getAll(): Promise<Window[]> {
        let windowList = await browser.windows.getAll();

        let keys = windowList.map(w => "win_" + w.id);
        let data = await browser.storage.local.get(keys)

        let tabs = await TabBuilder.getAllForWindows(windowList.map(w => w.id ?? -1));

        let windows = windowList.map(w => {
            let key = winKey(w);
            return new Window(w, tabs[w.id ?? -1], data[key])
        });

        return windows;
    }

    /**
     * Get a Window
     *
     * Creates a Window based on the given id. If storage data is found for
     * this window, it is retrieved.
     */
    static async get(id: number): Promise<Window> {
        let key = winKey(id);

        let data = await browser.storage.local.get(key);
        let cwin = await browser.windows.get(id)
        let tabs = await TabBuilder.getAllForWindow(id);

        let w = new Window(cwin, tabs, data[key])
        return w;
    }

    /**
     * Serializes a window to a json object for storage.
     *
     * The returned json will have two attributes: "key" the storage key, and
     * "val" a json object to be stored.
     *
     * Note: this only stores the excess data that can't be retrieved from the
     * browser window api.
     */
    static flattenWindow(window: Window): WindowData {
        let flat = {
            [window.key]: window.data,
        };
        return flat;
    }

    /**
     * Performs the actual data storage
     */
    static storeWindow(window: Window): Promise<void> {
        return browser.storage.local.set(WindowBuilder.flattenWindow(window));
    }

}

/*
 * Takes either a window or window Id, and returns the storage key string
 */
function winKey(w: browser.windows.Window | Window | number) {
    let id = typeof w == 'number' ? w : w.id;
    return "win_" + id
}
