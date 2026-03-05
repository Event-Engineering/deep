export const DEEP_ADDITIONAL_KEYS = 1;
export const DEEP_REMOVED_KEYS = 2;

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

export function deepDiff(original, edit, flags = 0, ignoreKeys = []) {
	let includeAdditionalKeys = ((flags & DEEP_ADDITIONAL_KEYS) === DEEP_ADDITIONAL_KEYS);
	let includeRemovedKeys = ((flags & DEEP_REMOVED_KEYS) === DEEP_REMOVED_KEYS);

	let diff = Object.entries(edit)
	.map(([key, datum]) => {
		if (ignoreKeys.includes(key)) {
			return [key, null, null];
		}

		if (datum && original[key] && datum instanceof Object && original[key] instanceof Object && Array.isArray(datum) === Array.isArray(original[key])) {
			let diff = deepDiff(original[key], datum, includeAdditionalKeys, ignoreKeys.map(v => v.startsWith(key + '.') ? v.substring(key.length + 1) : v));
			return [key, diff, diff && (Array.isArray(diff) || !! Object.keys(diff).length)];
		} else {
			return [key, datum, (includeAdditionalKeys || original.hasOwnProperty(key)) && original[key] !== datum];
		}
	});

	if (includeRemovedKeys) { // TODO
		diff.push(...Object.entries(original)
		.filter(([key]) => ! edit.hasOwnProperty(key))
		.map(([key]) => [key, undefined, true]));
	}

	if ( ! Array.isArray(edit)) {
		return Object.fromEntries(diff.filter(([_1, _2, v]) => v));
	}

	return diff.some(([k, d, hasDiff]) => hasDiff) || edit.length !== original.length ? diff.map(([_, diff, hasDiff]) => diff) : null;
}
