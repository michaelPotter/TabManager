import { observable, configure, action, flow, makeObservable } from "mobx";

type Page = "alltabs" | "archive"

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

