import { observable, action, makeObservable } from "mobx";

export type Page = "alltabs" | "active_groups" | "archive" | "archive2";

class PopupStore {
	page: Page = window.sessionStorage.getItem("popup-tab") as Page ?? "alltabs";
	errorMessage?: string = undefined;

	constructor() {
		makeObservable(this, {
			page: observable,
			setPage: action,
			errorMessage: observable,
			setErrorMessage: action,
		});
	}

	setPage = (p: Page) => {
		window.sessionStorage.setItem("popup-tab", p);
		return this.page = p
	}

	setErrorMessage = (message?: string) => {
		this.errorMessage = message;
	}

}

export default new PopupStore();

