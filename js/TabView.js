
class tabView {
	constructor(tab) {
		this.tab = tab;
		this.view = null;
	}

	/* returns the view for this tab
	 */
	getView() {
		if (this.view == null) {
			this.generateView();
		}
		return this.view;
	}

	/* generates the view for this tab
	 */
	generateView() {
		var tab = this.tab;
		// console.log("generating view");
		var row = document.createElement("div");
		var main = document.createElement("div");
		var trash = document.createElement("i");
		var tabTitle = document.createTextNode(" " + tab.title );
		row.id = tab.id;


		trash.className = "material-icons trash";
		trash.innerHTML = 'delete';
		trash.addEventListener("click", function(){trashClick(tab.id, event)}, true);

		main.addEventListener("click", function(){mouseClick(tab.id, event)}, true);
		main.addEventListener("auxclick", function(){trashClick(tab.id, event)}, true);
		main.appendChild(getPicture(tab));
		main.appendChild(tabTitle);

		row.append(trash);
		row.append(bookmarkStar(tab));
		row.append(main);

		main.className = "row-content div";
		row.className = "row div";
		if (tab.active) {
			row.className += " active";
		}
		this.view = row;
	}

}
