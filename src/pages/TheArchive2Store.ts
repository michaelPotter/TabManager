import { observable, action, makeAutoObservable } from "mobx";
import type { ArchivedWindowGroup } from "../js/model/archivedWindowGroup/ArchivedWindowGroup";

import ArchivedWindowGroupStore from '../js/model/archivedWindowGroup/ArchivedWindowGroupStore';

class TheArchive2Store {

	windowGroupIndex = 0;

	constructor() {
		makeAutoObservable(this);
	}

	get activeWindow(): ArchivedWindowGroup|undefined {
		// This might not work if it caches the group list
		return ArchivedWindowGroupStore.archivedWindowGroups[this.windowGroupIndex];
	}

}

export default new TheArchive2Store();

