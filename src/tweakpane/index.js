import * as Tweakpane from "https://esm.sh/tweakpane@3";

function addInput(pane, PARAMS, name, options, view) {
	pane.addInput(PARAMS, name, options).on("change", (e) => {
		// tweakpane mutates PARAMS in place, so e.value is a reference
		// to the original object. We need to clone objects so that
		// Jupyter actually emits a change on `model.set`
		let value = typeof e.value === "object"
			? structuredClone(e.value)
			: e.value;
		view.model.set(name, value, view);
		view.model.save_changes();
	});

	view.listenTo(view.model, `change:${name}`, (_model, value, context) => {
		// only need to refresh if change comes from other JS views or Python
		if (context?.cid === view.cid) {
			return;
		}
		PARAMS[name] = value;
		pane.refresh();
	});
}

function addMonitor(pane, PARAMS, name, options, view) {
	pane.addMonitor(PARAMS, name, options);
	view.listenTo(view.model, `change:${name}`, (_, value, ctx) => {
		if (ctx?.cid === view.cid) {
			return;
		}
		PARAMS[name] = value;
	});
}

function addAll(pane, PARAMS, inputs, view) {
	for (let [type, ...rest] of inputs) {
		if (type === "input" ) {
			let [name, options] = rest;
			addInput(pane, PARAMS, name, options, view);
			continue;
		}
		if (type === "monitor" ) {
			let [name, options] = rest;
			addMonitor(pane, PARAMS, name, options, view);
			continue;
		}
		if (type === "folder") {
			let [folderOptions, inputs] = rest;
			let folder = pane.addFolder(folderOptions);
			addAll(folder, PARAMS, inputs, view);
			continue;
		}
		throw new Error(`Tweakpane type '${type}' not supported.`);
	}

}

function * getNames(inputs) {
	for (let [type, ...rest] of inputs) {
		if (type === "input" ) {
			yield rest[0]
			continue;
		}
		if (type === "monitor" ) {
			yield rest[0]
			continue;
		}
		if (type === "folder") {
			yield *getNames(rest[1])
			continue;
		}
		throw new Error(`Tweakpane type '${type}' not supported.`);
		
	}
}

export function render(view) {
	function init(inputs) {
		let pane = new Tweakpane.Pane({ container: view.el });
		let PARAMS = {};
		for (let name of getNames(inputs)) {
			PARAMS[name] = view.model.get(name);
		}
		addAll(pane, PARAMS, inputs, view);
		return () => {
			pane.dispose();
			view.stopListening(view.model);
		};
	}

	let dispose = init(view.model.get("_inputs"));
	view.model.on("change:_inputs", (_, inputs) => {
		dispose();
		dispose = init(inputs);
	});
}
