/**
 * Runs the given callback if it exists.
 *
 * Used for optional callbacks. Will take many args. First arg should be the
 * callback function. The remaining args will be passed to the callback.
 */
function runCallback(callback) {
	if (callback != undefined) {
		var all_args = Array.from(arguments);
		var pass_thru_args = all_args.slice(1)
		callback(...pass_thru_args);
	}
}
