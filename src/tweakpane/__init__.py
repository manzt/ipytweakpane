import contextlib
from importlib.metadata import PackageNotFoundError, version
import pathlib

import anywidget
import traitlets

try:
    __version__ = version("tweakpane")
except PackageNotFoundError:
    __version__ = "uninstalled"


class Pane(anywidget.AnyWidget):
    _esm = pathlib.Path(__file__).parent / "index.js"
    _inputs = traitlets.List([]).tag(sync=True)
    _context = None

    def _append_input(self, input):
        if self._context is None:
            self._inputs = self._inputs + [input]
        else:
            self._context.append(input)

    def add(self, type, name, value, **options):
        assert not self.has_trait(
            name
        ), f"Pane already has trait '{name}'. Choose a new name."
        t = traitlets.Any(value).tag(sync=True)
        self.add_traits(**{name: t})
        self._append_input((type, name, options))

    def add_input(self, name: str, value, **options):
        self.add("input", name, value, **options)

    def add_monitor(self, name: str, value, **options):
        self.add("monitor", name, value, **options)

    def folder(self, title: str, **options):
        return folder_context_manager(self, title=title, **options)


@contextlib.contextmanager
def folder_context_manager(pane: Pane, **options):
    prev = pane._context
    pane._context = []
    try:
        yield pane
    finally:
        folder_contents = pane._context
        pane._context = prev
        pane._append_input(("folder", options, folder_contents))
