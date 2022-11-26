import React, {useState} from 'react';
import classnames from 'classnames';

/*
 * A Tab component.
 * TODO:
 *  - row middle click
 *  - container tab color
 */
export default function Tab(props) {
    const [isBookmarked, setBookmarked] = useState(false);
    props.tab.isBookmarked().then(setBookmarked);
    return (
        <div
            id={props.tab.id}
            className={classnames("row div tab", {"active":props.tab.active})}
        >
            {/* FIXME these should go AFTER */}
            <Trash onClick={props.trashClick}/>
            <Star filled={isBookmarked}/>
            <div className="row-content div" onClick={props.mainClick}>
                <ContextMarker />
                <Favicon src={props.tab.favIconUrl}/>
                {" " + props.tab.title}
            </div>
        </div>
    )
}

function Trash(props) {
	return <i className="material-icons trash" onClick={props.onClick}>delete</i>
}

function Star(props) {
	if (props.filled) {
		return <i className="material-icons star star_filled">star</i>
	} else {
		return <i className="material-icons star star_border">star_border</i>
	}
}

function ContextMarker(props) {
	if (props.color) {
		var opacity="1.0"
	} else {
		var opacity="0.0"
	}

	return (
		<svg className="contextMarker" viewBox="0 0 10 10" height="10px" width="10px">
			<circle cx="5" cy="5" r="5" fill={props.color} fillOpacity={opacity} />
		</svg>
	);
}

function Favicon(props) {
	let re_avoid = /^chrome:\/\/.*\.svg$/
    let src = re_avoid.test(props.src) ? "undefined" : props.src
    return <img src={src} height="20em"/>
}
