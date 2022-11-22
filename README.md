# (ipy)tweakpane

[![PyPI](https://img.shields.io/pypi/v/tweakpane.svg?color=green)](https://pypi.org/project/tweakpane)
[![License](https://img.shields.io/pypi/l/tweakpane.svg?color=green)](https://github.com/manzt/ipytweakpane/raw/main/LICENSE)

IPython/Jupyter notebooks module for
[Tweakpane UI](https://cocopon.github.io/tweakpane/).

## installation

```bash
pip install tweakpane
```

## example

```python
import tweakpane

pane = tweakpane.Pane()

pane.add_input("checkbox", True)
pane.add_input("number", 10.00)
pane.add_input("slider", 10, min=0, max=200)

with pane.folder(title="Folder") as f:
    f.add_input("color", dict(r=255, g=200, b=100))
    f.add_input("text", "Tweakpane")

pane
```

<img width="470" alt="example widget" src="https://user-images.githubusercontent.com/24403730/203362487-c1b9c676-188e-42f2-a7e4-fd7d1bd43d54.png">

Inputs are dynamically added to the `pane` as named
[traitlets](https://traitlets.readthedocs.io/en/stable/) and can be subscribed
to or updated like any other
[`ipywidget`](https://ipywidgets.readthedocs.io/en/stable/).

```python
# subscribe to changes
pane.observe(lambda change: ..., names=[
    "checkbox",
    "number",
    "slider",
    "color",
    "text",
])

# update pane programatically
pane.checkbox = False
pane.text = "Some other text"
```

## release

```bash
git tag -a vX.X.X  -m "X.X.X"
git push --follow-tags
```
