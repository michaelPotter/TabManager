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

// TODO change to Map probably
export type ArchivedWindowGroupServerData = {
	[name: string]: ArchivedWindowGroup;
}
