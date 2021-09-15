'use strict';
// https://stackoverflow.com/questions/28648292/right-click-menu-using-react-js


export default function hook(event) {
	const xPos = event.pageX + "px";
	const yPos = event.pageY + "px";
    addMenu = new nw.Menu();
    addMenu.append(new nw.MenuItem({
        label: 'doSomething',
        click: function() {
            // doSomething
        }
    }));

}
