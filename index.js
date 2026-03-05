export const DEEP_HIDE_ADDITIONAL_KEYS = 1;
export const DEEP_SHOW_REMOVED_KEYS = 2;
export const DEEP_PROPAGATE_IGNORE_KEYS = 4;

export function deepAssign(target, value) {
	Object.entries(value)
	.forEach(([key, value]) => {
		if (target[key]) {
			if ((target[key] instanceof Object) !== (value instanceof Object) || (Array.isArray(target[key]) !== Array.isArray(value))) {
				console.warn('Ignoring update of mismatched type', {key, value, original: target[key]});

				return;
			}
		} else if (value instanceof Object) {
			target[key] = Array.isArray(value) ? [] : {};
		}

		if (value instanceof Object) {
			if (Array.isArray(value)) {
				target[key].splice(0, target[key].length);
			}

			return deepAssign(target[key], value);
		}

		return target[key] = value;
	});

	return target;
}

export function deepDiff(original, edit, flags = 0, ignoreKeys = [], _path = '') {
	let showAdditionalKeys = ! ((flags & DEEP_HIDE_ADDITIONAL_KEYS) === DEEP_HIDE_ADDITIONAL_KEYS);
	let showRemovedKeys = ((flags & DEEP_SHOW_REMOVED_KEYS) === DEEP_SHOW_REMOVED_KEYS);
	let propagateIgnoreKeys = ((flags & DEEP_PROPAGATE_IGNORE_KEYS) === DEEP_PROPAGATE_IGNORE_KEYS);

	function shouldIgnore(key) {
		let fullPath = _path ? _path + '.' + key : key;
		return propagateIgnoreKeys
			? ignoreKeys.some(v => (! v.includes('.') && v === key) || v === fullPath)
			: ignoreKeys.includes(fullPath);
	}

	let diff = Object.entries(edit)
	.map(([key, datum]) => {
		if (shouldIgnore(key)) {
			return [key, null, null];
		}

		if (datum && original[key] && datum instanceof Object && original[key] instanceof Object && Array.isArray(datum) === Array.isArray(original[key])) {
			let fullPath = _path ? _path + '.' + key : key;
			let diff = deepDiff(original[key], datum, flags, ignoreKeys, fullPath);
			return [key, diff, diff && (Array.isArray(diff) || !! Object.keys(diff).length)];
		} else {
			return [key, datum, (showAdditionalKeys || original.hasOwnProperty(key)) && original[key] !== datum];
		}
	});

	if (showRemovedKeys) { // TODO
		diff.push(...Object.entries(original)
		.filter(([key]) => ! (shouldIgnore(key) || edit.hasOwnProperty(key)))
		.map(([key]) => [key, undefined, true]));
	}

	if ( ! Array.isArray(edit)) {
		return Object.fromEntries(diff.filter(([_1, _2, v]) => v));
	}

	return diff.some(([k, d, hasDiff]) => hasDiff) || edit.length !== original.length ? diff.map(([_, diff, hasDiff]) => diff) : null;
}
