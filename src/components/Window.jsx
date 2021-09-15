import React from 'react';

import Tab from './Tab.jsx';


/*
 * This is pretty simple for now, but could be more complex later.
 *
 * props.window - The Window object
 * props.tabs - A list of Tabs
 */
export default function Window(props) {
    let tabs = props.tabs.map(t =>
        <Tab
            tab={t}
            key={t.id}
            mainClick={() => t.focus()}
            trashClick={() => t.close()}
            />
    ) 

    return (
        <div>
            {tabs}
            <hr/>
        </div>
    );
};
