/*
 * TabBuilder.ts
 *
 * Methods for creating Tabs
 *
 * Note: this class would handle persistence of extra data too, if/when tabs eventually have any data that needs it.
 */
'use strict';

import _ from 'lodash';
import Tab from './model/Tab';

export default class TabBuilder {

    /**
     * Returns a list of all Tab objects for a given windowId.
     */
    static async getAllForWindow(windowId?: number): Promise<Tab[]> {
        let tabs = await browser.tabs.query({windowId: windowId});
        // TODO fetch data out of storage
        return tabs.map(t => new Tab(t));
    }

    /**
     * Returns a map of windowId to Tab object, for the given list of windowIds.
     */
    static async getAllForWindows(windowIds: number[]): Promise<Record<number, Tab[]>> {
        let promises = windowIds.map(async (id) => {
            let pair: [number, Tab[]] = [id, await this.getAllForWindow(id)];
            return pair
        })
        let tabPairs = await Promise.all(promises);
        let tabs = _.fromPairs(tabPairs);

        return tabs;
    }

    static async createFromBrowserTab(browserTab: browser.tabs.Tab): Promise<Tab> {
        return new Tab(browserTab);
    }
}
