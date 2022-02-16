---
title: "Ubuntu libsqliteodbc bug"
date: 2020-06-04
layout: post-layout.njk
tags: ["sqlite", "odbc", "libreoffice"]
---

Putting this here so I can find it again...

On Ubuntu 16.04, `libsqliteodbc`[^odbc]  installs dynamic library files
to the wrong directory.[^alt]

Instead of putting `libsqlite3odbc.so` in `/usr/lib/x86_64-linux-gnu`,
it puts it in a subdirectory, `odbc`.  And then
`libreoffice-base`[^lobase] looks for it in the normal place and can't
find it, leading to runtime errors if you try to connect via ODBC to an
Sqlite3 database:

```text
The connection to the data source "MY_DATA_SOURCE" could not be established.
[unixODBC][Driver Manager]Can't open lib 'libsqlite3odbc.so': file not found
```

So a fix is to install a symlink in the normal directory, pointing to
the installed `.so` file:

```bash
$ sudo ln -s odbc/libsqlite3odbc.so /usr/lib/x86_64-linux-gnu
```

[^odbc]: version [0.9992-0.1](https://packages.ubuntu.com/xenial/libsqliteodbc)
[^alt]: Or, alternatively, `libreoffice-base` is looking in the wrong place. But there seems no good reason to install the library files to a subdirectory.
[^lobase]: version  [1:5.1.6\~rc2-0ubuntu1\~xenial10](https://launchpad.net/ubuntu/+source/libreoffice/1:5.1.6~rc2-0ubuntu1~xenial10)

