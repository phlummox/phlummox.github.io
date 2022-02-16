---
title: "When running 'stack setup' for ghcjs…"
date: 2018-07-25T03:38:32+08:00
layout: post-layout.njk
tags: ["haskell", "ghcjs", "stack", "development"]
---

… make sure you *don't* have `cabal` in your path.
Otherwise you'll get odd build errors, and `ghcjs` will
never install: see [this](https://github.com/ghcjs/ghcjs/issues/631)
issue on the ghcjs issue tracker.

