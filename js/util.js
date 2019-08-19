/**
 * Runs the given callback if it exists.
 *
 * Used for optional callbacks. Will take many args. First arg should be the
 * callback function. The remaining args will be passed to the callback.
 */

var util = {
	runCallback(callback) {
		if (callback != undefined) {
			var all_args = Array.from(arguments);
			var pass_thru_args = all_args.slice(1)
			callback(...pass_thru_args);
		}
	},

	/**
	 * counts the number of tabs and passes as an int to callback
	 */
	countTabs(callback) {
		chrome.tabs.query({}, function(tabs) {
			callback(tabs.length);
		});
	}
}

export default util;
