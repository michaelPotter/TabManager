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
	}
}

export default new PopupStore();

