
import type { ArchivedTab } from '../../js/model/archivedWindowGroup/ArchivedWindowGroup';
import Favicon from '../lib/Favicon';

export default function(
	props: {
		tab: ArchivedTab,
	}
) {

	return (
		<div>
			<Favicon src={props.tab.favIconUrl}/>
			{" " + props.tab.title}
		</div>
	)
	
}

