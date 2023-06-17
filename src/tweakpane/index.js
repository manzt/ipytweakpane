import * as Tweakpane from "https://esm.sh/tweakpane@3";

function addInput(pane, PARAMS, name, options, model) {
	pane.addInput(PARAMS, name, options).on("change", (e) => {
		// tweakpane mutates PARAMS in place, so e.value is a reference
		// to the original object. We need to clone objects so that
		// Jupyter actually emits a change on `model.set`
		let value = typeof e.value === "object"
			? structuredClone(e.value)
			: e.value;
		model.set(name, value);
		model.save_changes();
	});

	model.on(`change:${name}`, () => {
		PARAMS[name] = model.get(name);
		pane.refresh?.();
	});
}

function addMonitor(pane, PARAMS, name, options, model) {
	pane.addMonitor(PARAMS, name, options);
	model.on(`change:${name}`, () => {
		PARAMS[name] = model.get(name);
	});
}

function addAll(pane, PARAMS, inputs, model) {
	for (let [type, ...rest] of inputs) {
		if (type === "input") {
			let [name, options] = rest;
			addInput(pane, PARAMS, name, options, model);
			continue;
		}
		if (type === "monitor") {
			let [name, options] = rest;
			addMonitor(pane, PARAMS, name, options, model);
			continue;
		}
		if (type === "folder") {
			let [folderOptions, inputs] = rest;
			let folder = pane.addFolder(folderOptions);
			addAll(folder, PARAMS, inputs, model);
			continue;
		}
		throw new Error(`Tweakpane type '${type}' not supported.`);
	}
}

function* getNames(inputs) {
	for (let [type, ...rest] of inputs) {
		if (type === "input") {
			yield rest[0];
			continue;
		}
		if (type === "monitor") {
			yield rest[0];
			continue;
		}
		if (type === "folder") {
			yield* getNames(rest[1]);
			continue;
		}
		throw new Error(`Tweakpane type '${type}' not supported.`);
	}
}

export function render({ model, el }) {
	function init(inputs) {
		let pane = new Tweakpane.Pane({ container: el });
		let PARAMS = {};
		for (let name of getNames(inputs)) {
			PARAMS[name] = model.get(name);
		}
		addAll(pane, PARAMS, inputs, model);
		return () => {
			pane.dispose();
			model.off();
		};
	}

	let dispose = init(model.get("_inputs"));
	model.on("change:_inputs", (_, inputs) => {
		dispose();
		dispose = init(inputs);
	});
}
