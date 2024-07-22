import { observable, action, makeObservable } from "mobx";

import Window from '../../js/model/window/Window';
import BrowserWindowHooks from './BrowserWindowHooks';
import _ from 'lodash';
import WindowDAO from "../model/window/WindowDAO";

class WindowStore {

	// Type Window|undefined helps protect from an object miss
	_windowsObject: Record<number, Window|undefined> = {};
    private state: "pending"|"finished" = "pending";

	constructor() {
		makeObservable(this, {
			_windowsObject: observable,
		});
        BrowserWindowHooks.engageHooks();

        WindowDAO.getAll()
			.then(action(windowsList => {
				this._windowsObject = _.keyBy<Window>(windowsList, w => w.id);
				this.state = "finished"
			}));
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
        return this._windowsObject[windowId];
    }

    /**
     * Closes the given window.
     */
    async closeWindow(windowId: number): Promise<void> {
        delete this._windowsObject[windowId];
        browser.windows.remove(windowId);
    }

	get windows() {
		return Object.values(this._windowsObject);
	}
}

export default new WindowStore();
