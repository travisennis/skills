---
name: scripting
description: Run Python scripts with dependencies using uv. Use when you need to write and execute Python code for data processing, automation, or analysis tasks.
metadata:
  version: "1.0"
---

# Python Scripting

Run Python scripts with automatic dependency management via `uv`.

## Installation

`uv` should already be installed. If not:
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

## Usage

```bash
uv run script.py                   # Run a script
uv run script.py arg1 arg2         # With arguments
uv run --python 3.10 script.py     # Specific Python version
uv run -v script.py                # Verbose output
echo 'print("hi")' | uv run -      # From stdin
```

In a project directory, use `--no-project` to skip installing the project:

```bash
uv run --no-project script.py
```

### Ad-hoc Dependencies

Run with dependencies without modifying the script:

```bash
uv run --with requests script.py
uv run --with 'requests>2,<3' script.py
uv run --with requests --with rich script.py
```

## Inline Script Metadata (Recommended)

Declare dependencies directly in the script via a TOML comment block:

```python
# /// script
# requires-python = ">=3.12"
# dependencies = [
#   "requests<3",
#   "rich",
# ]
# ///

import requests
from rich import print
```

Then just: `uv run script.py`

### Managing Script Dependencies

```bash
uv init --script example.py --python 3.12   # Create script with metadata
uv add --script example.py requests rich    # Add dependencies to script
```

### Alternative Index

```bash
uv add --index "https://example.com/simple" --script example.py requests
```

Adds to metadata:

```python
# [[tool.uv.index]]
# url = "https://example.com/simple"
```

### Locking Dependencies

```bash
uv lock --script example.py  # Creates example.py.lock
```

### Reproducibility

Pin resolution date to get deterministic results:

```python
# /// script
# dependencies = ["requests"]
# [tool.uv]
# exclude-newer = "2023-10-16T00:00:00Z"
# ///
```

### Executable Scripts (Shebang)

```python
#!/usr/bin/env -S uv run --script
# /// script
# dependencies = ["httpx"]
# ///

import httpx
print(httpx.get("https://example.com"))
```

```bash
chmod +x myscript
./myscript
```

## Dependency Specification

### Version operators
- `==` exact version
- `>=`, `>`, `<=`, `<` comparisons
- `~=` compatible release (e.g., `~=1.4` means >=1.4, <2.0)
- `!=` exclusion

### Sources
```python
# /// script
# dependencies = [
#     "pandas>=2.0",
#     "numpy",
#     "requests[socks]",          # optional extras
# ]
# ///
```

### Multiple dependency groups
```python
# /// script
# dependencies = ["pandas", "numpy"]
# dev-dependencies = ["pytest", "black"]
# ///
```

### External requirements file
```python
# /// script
# requirements = ["requirements.txt"]
# ///
```

## Common Patterns

### Data processing
```python
# /// script
# dependencies = ["pandas", "openpyxl"]
# requires-python = ">=3.9"
# ///

import pandas as pd

df = pd.read_excel("data.xlsx")
df.to_csv("output.csv", index=False)
```

### HTTP APIs
```python
# /// script
# dependencies = ["requests", "tenacity"]
# ///

import requests
from tenacity import retry, stop_after_attempt

@retry(stop=stop_after_attempt(3))
def fetch(url):
    return requests.get(url)
```

### Web scraping
```python
# /// script
# dependencies = ["beautifulsoup4", "requests"]
# ///

from bs4 import BeautifulSoup
import requests

r = requests.get("https://example.com")
soup = BeautifulSoup(r.text, "html.parser")
```

### Image processing
```python
# /// script
# dependencies = ["pillow"]
# ///

from PIL import Image

img = Image.open("input.png")
img.resize((800, 600)).save("output.png")
```

## Environment Variables

```python
# /// script
# dependencies = ["python-dotenv"]
# ///

import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("API_KEY")
```

Or pass via command line:
```bash
UV_ENV_MODE=virtual uv run script.py
```

## Configuration Options

### Custom PyPI index
```python
# /// script
# dependencies = ["package"]
# index-url = "https://pypi.mycompany.com/simple"
# ///
```

### Extra indices
```python
# /// script
# dependencies = ["package"]
# [[tool.uv.index]]
# url = "https://extra.pypi.com/simple"
# name = "extra"
# ///
```

### Offline mode
```bash
uv run --no-install script.py  # Use cached packages only
```

### Resolution strategy
```bash
uv run --resolution lowest-direct script.py  # Lowest versions
uv run --resolution frozen script.py        # Locked versions
```

## Troubleshooting

### Package not found
```bash
# Check spelling and try with version constraint
uv run -v script.py  # Verbose output shows resolution
```

### Python version mismatch
```python
# /// script
# requires-python = ">=3.10"
# ///
```

### Dependency conflicts
```bash
# Clean cache and retry
rm -rf ~/.cache/uv
uv run script.py
```

## Best Practices

1. Pin major versions for reproducibility (`pandas>=2.0,<3.0`)
2. Always specify `requires-python` for faster resolution
3. Use verbose mode (`-v`) when debugging issues
4. Keep dependencies minimal - import only what you need
5. Use inline dependencies for single scripts, pyproject.toml for projects
