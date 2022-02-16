---
title: "Accessing the filesystem of a running Docker container"
date: 2018-07-30T12:34:02+08:00
layout: post-layout.njk
tags: ["docker"]
---

Well that's neat --- there's a [quick-and-dirty
trick](https://stackoverflow.com/a/32498954/6818792) for accessing the
filesystem of a running Docker container from your host machine. Not
especially safe, but much quicker than messing around with ssh servers
etc. within the container.

So, within the *`proc`*
filesystem, <code>/proc/<em>some-pid</em>/root/</code>
exposes the root filesystem that process <code><em>some-pid</em></code> is running
on. So we can do the following, to get an interactive shell on that
filesystem:

1.  Find some process that’s running inside the container, that we can uniquely identify. (In the following example, we assume java is running nowhere else but inside the container.)

2.  Run the following:

    ```
    > sudo -s
    > cd /proc/$(pgrep java)/root/
    ```

And voilà, we're in.

We can also mount that filesystem somewhere more convenient. There are
probably better ways, but mine is: given a directory
`/proc/`*`some-pid`*`/root/`, we can execute

```
  > sudo df -h /proc/some-pid/root/
```

to get the path to the device being used for process
*`some-pid`*'s filesystem (normally, an image file sitting under
`/var/lib/docker`). For instance:

```
 > sudo df -h /proc/16503/root/
 Filesystem      Size  Used Avail Use% Mounted on
 overlay         1.6T  269G  1.4T  17% /var/lib/docker/overlay2/d69311eb816371025cf40a7832689180f7805a685badc14a2e84db704d1cbb9f/merged
```

We can then mount that somewhere else using:

```
> sudo mount --bind /var/lib/docker/overlay2/d69311eb816371025cf40a7832689180f7805a685badc14a2e84db704d1cbb9f/merged /some/where/convenient
```

This means that if we're trying to debug or analyse what's happening in
the container, we can now do so with all the resources available on our
host machine (GUI tools, binary analysis tools) without having to
install them in the container.

(See also: [File explorer GUI for a running docker
container?](https://superuser.com/questions/1288055/file-explorer-gui-for-a-running-docker-container#1288058)
on Super User.)


