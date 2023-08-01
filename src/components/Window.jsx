import React, { useState } from 'react';

import Tab from './Tab.jsx';
import {Trash} from './Trash';
import { ReactSortable } from 'react-sortablejs';

// TODO this should probably go somewhere else??
// NOTE: there's a sort of animation bug here where the tabs jump around...
// When you drag a tab in the list, we call the browser "move" api to perform
// the actual tab move, which then turns around and calls our callback causing a re-render.
// It'd be better to update our internal list of tabs with the new ordering,
// and somehow ignore the browser callback.
function onDragEnd(evt) {
	var itemEl = evt.item;
	// console.log(evt);
	browser.tabs.move(
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

    return (
        <>
            <div className="windowHeader">
                {props.tabs.length} tabs
                <Trash/>
            </div>
            <ReactSortable
                id={props.window.id}
                class="window"
                list={props.tabs}
                // Normally you'd use a state hook and pass "setState" here, but using a state hook interferes with
                // re-rendering due to out-of band tab changes.
                setList={() => {}}
                animation={200}
                onEnd={onDragEnd}
            >
                {
                    props.tabs.map(tab => (
                        <Tab
                            key={tab.id}
                            tab={tab}
                            mainClick={() => tab.focus()}
                            trashClick={() => tab.close()}
                            />
                    ))
                }
            </ReactSortable>
            <hr/>
        </>
    );
}
