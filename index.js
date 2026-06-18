export const DEEP_HIDE_ADDITIONAL_KEYS = 1;
export const DEEP_SHOW_REMOVED_KEYS = 2;
export const DEEP_PROPAGATE_IGNORE_KEYS = 4;

export function deepAssign(target, value) {
	if (target) {
		if ((target instanceof Object) !== (value instanceof Object) || (Array.isArray(target) !== Array.isArray(value))) {
			console.warn('Ignoring update of mismatched type', { value, original: target });

			return target;
		}
	} else if (value instanceof Object) {
		target = Array.isArray(value) ? [] : {};
	}

	if (! (value instanceof Object)) {
		return value;
	}

	if (Array.isArray(value)) {
		let original = target.splice(0, target.length);

		target.push(...value.map((v, k) => deepAssign(original[k], v)));
	} else {
		Object.entries(value)
		.forEach(([ key, value ]) => {
			return target[key] = deepAssign(target[key], value);
		});
	}

	return target;
}

function shouldIgnorePropagate(ignoreKeys, _path, key) {
	let fullPath = _path ? _path + '.' + key : key;

	return ignoreKeys.some(v => v === fullPath || fullPath.endsWith('.' + v));
}

function shouldIgnoreScoped(ignoreKeys, _path, key) {
	return ignoreKeys.includes(_path ? _path + '.' + key : key);
}

export function deepDiff(original, edit, flags = 0, ignoreKeys = [], _path = '') {
	let showAdditionalKeys = ! ((flags & DEEP_HIDE_ADDITIONAL_KEYS) === DEEP_HIDE_ADDITIONAL_KEYS);
	let showRemovedKeys = ((flags & DEEP_SHOW_REMOVED_KEYS) === DEEP_SHOW_REMOVED_KEYS);
	let propagateIgnoreKeys = ((flags & DEEP_PROPAGATE_IGNORE_KEYS) === DEEP_PROPAGATE_IGNORE_KEYS);

	let shouldIgnore = (propagateIgnoreKeys ? shouldIgnorePropagate : shouldIgnoreScoped).bind(null, ignoreKeys, _path);

	let diff = Object.entries(edit)
	.map(([ key, datum ]) => {
		if (shouldIgnore(key)) {
			return [ key, null, null ];
		}

		if (datum && original[key] && datum instanceof Object && original[key] instanceof Object && Array.isArray(datum) === Array.isArray(original[key])) {
			let fullPath = _path ? _path + '.' + key : key;
			let diff = deepDiff(original[key], datum, flags, ignoreKeys, fullPath);
			return [ key, diff, diff && (Array.isArray(diff) || !! Object.keys(diff).length) ];
		} else {
			return [ key, datum, (showAdditionalKeys || original.hasOwnProperty(key)) && original[key] !== datum ];
		}
	});

	if (showRemovedKeys) { // TODO
		diff.push(...Object.entries(original)
		.filter(([ key ]) => ! (shouldIgnore(key) || edit.hasOwnProperty(key)))
		.map(([ key ]) => [ key, undefined, true ]));
	}

	if (! Array.isArray(edit)) {
		return Object.fromEntries(diff.filter(([ _1, _2, v ]) => v));
	}

	return diff.some(([ k, d, hasDiff ]) => hasDiff) || edit.length !== original.length ? diff.map(([ _, diff, hasDiff ]) => diff) : null;
}
