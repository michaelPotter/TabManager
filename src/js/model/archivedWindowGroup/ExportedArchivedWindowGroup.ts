/*
 * A version of ArchivedWindowGroup that is suitable for exporting to a file.
 *
 * See also ArchivedWindowGroup.ts
 */

import { ArchivedTab, ArchivedWindow, ArchivedWindowGroup } from "./ArchivedWindowGroup";

// Used when exporting/importing
export type ArchivedWindowGroupExportV1 = {
	"$schemaVersion": "v1",
	"$schemaName": "ArchivedWindowGroups",
	archivedWindowGroups: ExportedArchivedWindowGroup[];
	favicons: Record<string, string>;
}
export type ArchivedWindowGroupExport = ArchivedWindowGroupExportV1;

export type ExportedArchivedWindowGroup = Omit<ArchivedWindowGroup, 'windows'> & {
	windows: ExportedWindow[];
}

export type ExportedWindow = Omit<ArchivedWindow, 'tabs'> & {
	tabs: ExportedTab[];
	// Optional for backwards compat
	activeTabIndex?: number;
}

export type ExportedTab = Omit<
	ArchivedTab,
	'favIconUrl'|'active'
> & {
	favIconUrl: number|undefined;
}

