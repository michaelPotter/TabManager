import { observable, configure, action, flow, makeObservable, runInAction } from "mobx";

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
				this._makeThingsObservable();
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

	/**
	 * This function reaches deep into the models structure to add observable
	 * hooks to things that need it. I'm not sure this is the best way to do it
	 * or even that this is the best place, but it'll be easier to try it here
	* first.
	 */
	_makeThingsObservable() {
		Object.values(this._windowsObject).forEach(w => {
			makeObservable(w as Window, {
				tabs: observable,
				removeTab: action,
				addTab: action,
				moveTab: action,
			});
			(w as Window).tabs.forEach(t => {
				makeObservable(t, {
					tab: observable,
					active: observable,
					updateTab: action,
					setActive: action,
				});
			});
		});
	}

	get windows() {
		return Object.values(this._windowsObject);
	}
}

export default new WindowStore();
