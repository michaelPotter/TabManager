import { observable, configure, action, flow, makeObservable } from "mobx";

export type Page = "alltabs" | "archive" | "active_groups"

class PopupStore {
	page: Page = window.sessionStorage.getItem("popup-tab") as Page ?? "alltabs";

	constructor() {
		makeObservable(this, {
			page: observable,
			setPage: action,
		});
	}

	setPage = (p: Page) => {
		window.sessionStorage.setItem("popup-tab", p);
		return this.page = p
	}
}

export default new PopupStore();

