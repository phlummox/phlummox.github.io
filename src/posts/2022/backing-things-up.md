---
title: "Backing Things Up"
date: 2022-02-10
layout: post-layout.njk
tags: ["backups", "home", "cloud"]
---

[/u/bigheadsmith][bighead] just [asked on Reddit][reddit-post]
about good solutions for local and remote backups
for home PCs -- so I offered an outline of my current backup regime.
<!-- excerpt -->
Only a couple
of responses so far, but suggestions seem to converge around [`rclone`][rclone] and
[`restic`][restic] being good solutions on Linux. Restic also received a lot
of enthusiastic support on a recent-ish [Hacker News post][hn-post], with some
users saying they'd switched to restic from borg.

If you're on Ubuntu, a downside of `restic` is that the versions of it in the
Ubuntu LTSs lag terribly behind upstream. My solution is to cobble together
quick-and-dirty `.deb` files that include recent fixes -- that way, I can still easily
track what's been installed where with `dpkg` and `apt`.
I do also now have the onus of keeping up to date with upstream myself, but
luckily, `restic` doesn't seem to have new versions released *all* that frequently.
Thus, I've got a quick-and-dirty `.deb` version of [`restic`][restic-deb]
on GitHub, and a friendly fork of [`backupninja`][backupninja] with recent
bug fixes applied.

[bighead]: https://www.reddit.com/user/bigheadsmith
[reddit-post]: https://www.reddit.com/r/homelab/comments/sp0di5/local_and_remote_backups/
[rclone]: https://rclone.org
[restic]: https://restic.net
[hn-post]: https://news.ycombinator.com/item?id=29209455#29210323
[restic-deb]: https://github.com/phlummox-dev/restic-deb
[backupninja]: https://github.com/phlummox-patches/backupninja
