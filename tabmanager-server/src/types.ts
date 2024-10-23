export type AppConfig = {
	port: number;
	dataDir: string;
}

export type ActiveWindowGroup = {
	name: string;
	windowIds: number[];
}

export type ArchivedWindowGroup = {
	name: string;
	windows: any[];
	archiveDate: Date;
}

export type Icon = {
	// I'd rather call this field "hash", but it needs to be "name" for the FileDAO
	name: string;
	favIconUrl: string;
}

// TODO change to Map probably
export type ArchivedWindowGroupServerData = {
	[name: string]: ArchivedWindowGroup;
}
