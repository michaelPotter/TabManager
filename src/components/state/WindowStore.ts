import { observable, configure, action, flow, makeObservable } from "mobx";

export default class WindowStore {
	areTabsRolledUp = false;	

	constructor() {
		makeObservable(this, {
			areTabsRolledUp: observable,
			toggleTabsRolledUp: action,
		});
	}

	toggleTabsRolledUp = () => {
		this.areTabsRolledUp = !this.areTabsRolledUp;
	}
}
