import { observer } from "mobx-react";

import _ from 'lodash';

import ArchivedWindowGroupStore from '../js/model/archivedWindowGroup/ArchivedWindowGroupStore';
import TheArchive2Store from './TheArchive2Store';
import ArchivedWindowGroup from "../components/archive/ArchivedWindowGroup";

const TheArchive2 = observer(() => {
	return (
		<div style={{display: 'flex'}}>
			<div style={{flexGrow: 1}} className="theArchive2List">
				<ul>
					{ArchivedWindowGroupStore.archivedWindowGroups.map((g, i) => (
						<li
							key={g.name}
							onClick={() => TheArchive2Store.windowGroupIndex = i}
						>{
							i === TheArchive2Store.windowGroupIndex ?
								<strong>{g.name}</strong> :
							g.name
						}</li>
					))}
				</ul>
			</div>
			<div style={{flexGrow: 3}}>
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
