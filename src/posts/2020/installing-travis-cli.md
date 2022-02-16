---
title: "Installing Travis cli"
date: 2020-07-14
layout: post-layout.njk
tags: ["travis", "CI"]
customStyle: |
    article li {
      margin-top: 18pt;
    }
---


A reminder to myself on how to install the Travis CLI command-line tool
on Ubuntu
(which is the only time I ever make use of Ruby, and which I only ever
do when installing a fresh OS).

1.  Install Ruby.

    ```bash
    $ sudo apt install ruby ruby-dev
    ```

#.  Install the Travis gem.

    ```bash
    gem install --user-install travis
    ```

    The output of this will include a warning that
    "You don't have <code>/home/&#x200b;phlummox/&#x200b;.gem/&#x200b;ruby/&#x200b;2.5.0/&#x200b;bin</code> [or something
    similar] in your PATH, gem executables will not run".

#.  So ensure it's added next time you log in:

    ```bash
    $ echo 'PATH=$HOME/.gem/ruby/2.5.0/bin:$PATH' >> ~/.profile
    ```

    (And `source ~/.profile`, to update your path right now.)

#.  Run `travis login`, **OR** (more likely) `travis login --pro`,
    to authenticate with the Travis CLI servers using GitHub.
    The former logs you in to [travis-ci.org](https://travis-ci.org/),
    the latter to [travis-ci.com](https://www.travis-ci.com/); the `.org`
    server will eventually be deprecated, IIRC.

#.  Do whatever Travis-related task you needed to do. Probably, something like

    ```
    $ travis encrypt --pro DOCKER_USERNAME=my-user-name --add env.global
    $ travis encrypt --pro DOCKER_PASSWORD=my-password  --add env.global
    ```


