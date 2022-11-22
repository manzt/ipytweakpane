# (ipy)tweakpane

Python bindings for [Tweakpane](https://cocopon.github.io/tweakpane/)

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
