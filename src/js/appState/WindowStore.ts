import { observable, configure, action, flow, makeObservable } from "mobx";

import Window from '../../js/model/window/Window';

class WindowStore {

	windows: Window[] = [];

	constructor() {
		makeObservable(this, {
			windows: observable,
			setWindows: action,
		});
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

export default new WindowStore();
