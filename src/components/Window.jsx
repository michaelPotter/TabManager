import React, { useState } from 'react';

import Tab from './Tab.jsx';
import { ReactSortable } from 'react-sortablejs';


// TODO this should probably go somewhere else??
function onDragEnd(evt) {
	var itemEl = evt.item;
	// console.log(evt);
	chrome.tabs.move(
		parseInt(itemEl.id),
		{windowId:parseInt(evt.to.id),
			index:evt.newIndex},
		function(tab) {}
	);
}

/*
 * This is pretty simple for now, but could be more complex later.
 *
 * props.window - The Window object
 * props.tabs - A list of Tabs
 */
export default function Window(props) {

    // const [state, setState] = useState<ItemType[]>(items);
    const [state, setState] = useState(props.tabs);

    return (
        <>
            <ReactSortable
                id={props.window.id}
                class="window"
                list={state}
                setList={setState}
                animation={200}
                onEnd={onDragEnd}
            >
                {
                    state.map(tab => (
                        <Tab
                            key={tab.id}
                            tab={tab}
                            mainClick={() => tab.focus()}
                            trashClick={() => tab.focus()}
                            />
                    ))
                }
            </ReactSortable>
            <hr/>
        </>
    );
}
