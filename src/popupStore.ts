import { observable, action, makeObservable } from "mobx";

import Window from './js/model/window/Window';

export type Page = "alltabs" | "archive" | "active_groups"

class PopupStore {
	page: Page = window.sessionStorage.getItem("popup-tab") as Page ?? "alltabs";
	windows: Window[] = [];

	constructor() {
		makeObservable(this, {
			page: observable,
			windows: observable,
			setPage: action,
			setWindows: action,
		});
	}

	setPage = (p: Page) => {
		window.sessionStorage.setItem("popup-tab", p);
		return this.page = p
	}

	setWindows(windows: Window[]) {
		this.windows = windows;
		this._makeThingsObservable();
	}

	/**
	 * This function reaches deep into the models structure to add observable
	 * hooks to things that need it. I'm not sure this is the best way to do it
	 * or even that this is the best place, but it'll be easier to try it here
	* first.
	 */
	_makeThingsObservable() {
		this.windows.forEach(w => {
			makeObservable(w, {
				tabs: observable,
				removeTab: action,
				addTab: action,
				moveTab: action,
			});
			w.tabs.forEach(t => {
				makeObservable(t, {
					tab: observable,
					active: observable,
					updateTab: action,
					setActive: action,
				});
			});
		});
	}
}

export default new PopupStore();

