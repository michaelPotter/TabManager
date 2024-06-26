import { observable, configure, action, flow, makeObservable } from "mobx";

export type Page = "alltabs" | "archive" | "active_groups"

class PopupStore {
	page: Page = "alltabs";

	constructor() {
		makeObservable(this, {
			page: observable,
			setPage: action,
		});
	}

	setPage = (p: Page) => this.page = p
}

export default new PopupStore();

