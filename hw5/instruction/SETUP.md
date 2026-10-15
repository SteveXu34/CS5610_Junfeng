# Setup

Cheat sheet. For the full version (i.e., why miniforge and not Anaconda, WSL
setup, vscode, installing `make` and `git`) see
[ds5110/git-intro](https://github.com/ds5110/git-intro):
[setup.md](https://github.com/ds5110/git-intro/blob/main/setup.md) and
[conda.md](https://github.com/ds5110/git-intro/blob/main/conda.md). Those are written 
for a different course, so read them for the rationale behind the environment advice.

## 1. A Unix-like shell

macOS and Linux: you already have one. Windows: install
[WSL](https://learn.microsoft.com/en-us/windows/wsl/install) and use the WSL
terminal -- **not PowerShell**.

## 2. conda, from miniforge

Install from <https://conda-forge.org/download/> if you don't have `conda`.
Not Anaconda and not miniconda (see `conda.md` above for why).

## 3. The environment

From this repo:

```
conda env create -f environment.yml
conda activate fastapi-server
```

* Run `conda activate fastapi-server` in every new terminal.
* This installs `make` too, so `make run` and `make test` work -- but only
  with the environment activated.
* If you already have a Python setup you like, keep it. Just install what's in
`environment.yml` yourself.

## 4. Node.js

You need this to serve your `hw-client` frontend locally in the homework --
opening it from `file://` won't work once it starts fetching your API. 
You probably already have Node from Week 1's Vercel deploy, so check first:

```
node -v
```

If that prints a version, you're set. If not, install the **LTS** release
from [nodejs.org](https://nodejs.org/en/download) -- same as Week 1's Vercel
setup, so you end up with one Node, not two.

## 5. Check that it worked

```
python -c "import fastapi, psycopg2; print('ok')"
uvicorn --version
node -v
```

All three should print something, none should raise. `ModuleNotFoundError`
usually means the environment isn't activated -- check that your prompt shows
`fastapi-server`.

## If you get stuck

Post in Teams with the exact command and the exact error text, not a
paraphrase. Getting an environment working on an unfamiliar machine is a
normal part of this job, and the real message is what makes it debuggable.
