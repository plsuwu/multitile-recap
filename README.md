# multitile recap

this was supposed to generate a 3x3 panel monthly recap but the recaps are locked behind the twitch gql api so this may never eventuate.

## install & run

uses an in-memory cache with bun's builtin sqlite db, so it must be run with the bun runtime rather than node.js:

```bash
git clone https://github.com/plsuwu/multitile-recap
cd multitile-recap
bun install

# and then run with bun js runtime, passing the `dev` flag to vite:
bun --bun run dev -- --mode dev
```
