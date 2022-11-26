import React, { useState } from 'react';

import Tab from './Tab.jsx';
import { ReactSortable } from 'react-sortablejs';


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
        <div>
            <ReactSortable list={state} setList={setState}>
                {
                    state.map(tab => (
                        <Tab
                            tab={tab}
                            mainClick={() => tab.focus()}
                            trashClick={() => tab.focus()}
                            />
                    ))
                }
            </ReactSortable>
            <hr/>
        </div>
    );
}
