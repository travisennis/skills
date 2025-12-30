---
name: scripting
description: Run Python scripts with dependencies using uv. Use when you need to write and execute Python code for data processing, automation, or analysis tasks.
---

# Python Scripting

Run Python scripts with automatic dependency management via `uv`.

## Usage

```bash
uv run script.py
```

## Script Format

Add dependencies in a comment block at the top:

```python
# /// script
# dependencies = ["pandas", "numpy"]
# ///

import pandas as pd
import numpy as np

# Your code here...
```

## Example

```python
# /// script
# dependencies = ["pandas"]
# ///

import pandas as pd

data = {'A': [1, 2, 3], 'B': [4, 5, 6]}
df = pd.DataFrame(data)
print(df)
```
