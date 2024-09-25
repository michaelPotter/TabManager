import { observer } from "mobx-react";

import _ from 'lodash';

import { ListGroup } from 'react-bootstrap';

import ArchivedWindowGroupStore from '../js/model/archivedWindowGroup/ArchivedWindowGroupStore';
import TheArchive2Store from './TheArchive2Store';
import ArchivedWindowGroup from "../components/archive/ArchivedWindowGroup";

const TheArchive2 = observer(() => {
	return (
		<div style={{display: 'flex'}}>
			{/* LEFT COLUMN */}
			<div style={{flexGrow: 1}} className="theArchive2List overflow-scroll">
				<ListGroup>
					{ArchivedWindowGroupStore.archivedWindowGroups.map((g, i) => (
						<ListGroup.Item
							key={g.name}
							action
							onClick={() => TheArchive2Store.windowGroupIndex = i}
						>
							<div>{g.name}</div>
							<div className="archive_group_metadata">
								{g.archiveDate?.toString?.()}
							</div>
							<div className="archive_group_metadata">
								{(() => {
									let tabCount = g.windows.reduce((acc, w) => w.tabs.length + acc, 0)
									return `${g.windows.length} windows - ${tabCount} tabs`
								})()}
							</div>
						</ListGroup.Item>
					))}
				</ListGroup>
			</div>

			{/* RIGHT COLUMN */}
			<div style={{flexGrow: 3}} className="overflow-scroll">
				{ TheArchive2Store.activeWindow &&
					<ArchivedWindowGroup
						archivedWindowGroup={TheArchive2Store.activeWindow}
					/>
				}
			</div>
		</div>
	)
});

export default TheArchive2;
