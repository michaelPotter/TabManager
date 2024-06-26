import React, { useState, useMemo } from 'react';
import { observer } from "mobx-react";

import WindowComponent from './Window';
import WindowManager from '../js/model/window/WindowManager';
import WindowGroup from '../js/model/windowGroup/WindowGroup';

/**
 * WindowGroup
 */
export default observer((
	props : {
		windowGroup: WindowGroup,
	}
) => {
	return (
		// TODO add rollup support
		<>
			<p>{props.windowGroup.name}</p>
			{props.windowGroup.windows.map(w => (
				<WindowComponent
					window={w}
					tabs={w.tabs}
					key={w.id}
					onCloseClick={() => WindowManager.closeWindow(w.id)}
					/>
			))}
		</>
	)
});
