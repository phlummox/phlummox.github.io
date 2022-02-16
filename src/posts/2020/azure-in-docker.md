---
title: "Running Azure's <samp>az</samp> command-line tool from a docker container; or, the \"credentials in a container\" trick"
date: 2020-08-17
layout: post-layout.njk
tags: ["azure", "docker", "container", "cli"]
customStyle: |
  .web-login {
    display: block;
    padding: 0.5em;
    font-size: 13px;
    font-family: Menlo,Monaco,Consolas,"Courier New",monospace;
    margin: 0 0 0.5ex;
    word-wrap: break-word;
    background-color: #f5f5f5;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
---

<!--
draft: true
-->


Every cloud platform provider has their own CLI tool they want you to
install, all with different dependencies and install methods.

[Some][heroku-cli]{target="_blank"} [want][digitalocean-cli]{target="_blank"}
you to [install][snap-mint]{target="_blank"}
their tools [using][snap-malware]{target="_blank"} [Snap][snap]{target="_blank"};
[some][aws-cli]{target="_blank"} want you
to run install scripts as [<samp>root</samp>][aws-locations]{target="_blank"} that
add files not managed by your OS's package management
system;[^aws-credit] [some][sap-install]{target="_blank"} want you to click through
[a license][sap-license]{target="_blank"} where
you agree to be bound by the laws of Germany.
Occasionally, you might find one who actually packages their tool
for [at least a few][google-install]{target="_blank"} different OS distributions, or even
provides a [statically-linked binary][aliyun-install]{target="_blank"} plus the
[source code][aliyun-github]{target="_blank"} it was built from.
Really though, the best CLI is one you [don't have to
install at all][az-cloud-shell]{target="_blank"}.

[^aws-credit]: Though to give Amazon credit, they do at least *tell* you
  where their install script will be creating files. So it would be
  pretty easy to package the resulting files up into whatever package
  is native to your distribution (e.g. `.deb` or `.rpm` files).

I'm surprised (and annoyed, of course)
that more cloud providers don't provide web-based shell
access to their tools. But when they don't, the next
best option might be to install the tool in a Docker container.
(In any case, working in a [webssh][webssh2]{target="_blank"} session gets a bit
wearisome after a while, somewhere around the tenth time you
accidentally hit `ctrl-r` and refresh the page instead of searching
your command history. Installing a tool on your own machine
does have *some* benefits.)

Rather than having your development environment cluttered with dozens or
even hundreds of dependencies you neither want nor need, why not
confine each provider's tools to a single Docker container? Then you
will have
to clutter your development environment
with potentially only [*one*][docker]{target="_blank"} [baroque][baroque]{target="_blank"},
[Rube][rube]{target="_blank"}
[Goldberg][goldberg]{target="_blank"}[–esque][esque]{target="_blank"},
[Kudzu-][kudzu]{target="_blank"}pervasive
framework.[^systemd]

[^systemd]: Well, two, if your OS also
  uses [systemd](https://lwn.net/Articles/676831/){target="_blank"}.

<!--
sap archived at <http://archive.is/8wq7h>
-->

Taking Azure's `az` tool as an example, you can do it like so:

1.  Pull the Docker image (based on Alpine Linux) for the `az` CLI
    tool:[^mcr] [^mcr-impl]

    ```bash
    docker pull mcr.microsoft.com/azure-cli
    ```
2.  Create a docker volume which will hold the contents of the `/root`
    directory, which is where our credentials are stored:

    ```bash
    docker -D run -v /root --name azconfig mcr.microsoft.com/azure-cli
    ```

[^mcr]: Microsoft hosts the `az` CLI docker images on its own registry,
  the [Microsoft Container Registry](https://github.com/microsoft/containerregistry){target="_blank"},
  located at <https://mcr.microsoft.com>{target="_blank"}, so when pulling from it  we
  have to use a [qualified reference](https://windsock.io/referencing-docker-images/){target="_blank"}
  to the image we want. If we wanted to explore the tags available for
  the `azure-cli` image, we could run \
  &nbsp; \
  `curl -L https://mcr.microsoft.com/v2/azure-cli/tags/list`
  &nbsp;\
  &nbsp;\
  [This][exploring-mcr]{target="_blank"} blog post suggests it also should be possible to
  explore the various repositories in the [MCR registry][ras-syndrome]{target="_blank"}
  from within the very
  nifty [Visual Studio Code](https://code.visualstudio.com/){target="_blank"} IDE, but I
  couldn't get that to work, and Microsoft
  [doesn't seem][no-ms-browsing]{target="_blank"} to want you to.

[^mcr-impl]: Interestingly, if you look at the headers of the response
  from `mcr.microsoft.com`, using `curl -v`, the `Host` name is
  `openresty`, suggesting Microsoft's registry is powered by the
  open source
  [OpenResty](https://openresty.org/en/){target="_blank"} variant of
  Nginx, which adds to Nginx the ability to make use of libraries
  written in LuaJIT.
  Or uses it as a reverse proxy, anyway.
  How things [have changed][ballmer-changed]{target="_blank"} since the days of
  ["Linux is a cancer"][linux-cancer]{target="_blank"} (or,
  ["communism"][linux-communism]{target="_blank"}) and
  ["Embrace, extend, extinguish"][eex]{target="_blank"}! Hopefully.

We now have a stopped Docker container called `azconfig`, containing an
anonymous volume[^anon-vols] which contains the contents of the `/root`
directory. We can use the volume by supplying `--volumes-from azconfig`
as an argument to the `docker run` command.

(Note that we don't supply `--rm` as an argument this first time round,
since we want to actually *keep* the container and its attached volume.)

3.  Spin up a new container which mounts the volume from our `azconfig` one:

    ```bash
    docker run --rm -it --volumes-from azconfig mcr.microsoft.com/azure-cli
    ```

This time we *do* use the `--rm` argument: we don't care if this container
disappears, the credentials will be stored in the volume.

4.  Inside the container, we can run

    ```sh
    az login
    ```

    to log on. The tool displays a message like

    ::: { .web-login style="color: #AA5500 !important; font-family: monospace;" }

    To sign in, use a web browser to open the page <https://microsoft.com/devicelogin>{ style="color: #AA5500 !important; font-family: monospace;" } and enter the code XXXXXXXXX to authenticate.

    :::

    where the "`XXXXXXXXX`" is some 9-character code Microsoft uses to
    identify the device you're logging in from. Follow the instructions,
    and voilà -- we're in.

Now we can run whatever commands we like inside the running container --
try typing `az account list`, just to check that the tool is working:

```text
$ az account list
[
  {
    "cloudName": "AzureCloud",
    "homeTenantId": "<REDACTED>",
    "id": "<REDACTED>",
    "isDefault": true,
    "managedByTenants": [],
    "name": "Free Trial",
    "state": "Enabled",
    "tenantId": "<REDACTED>",
    "user": {
      "name": "phlummox@phlummox.dev",
      "type": "user"
    }
  }
]
```

And regardless of what we do with the new containers -- keep them running,
stop them, throw them away -- we can just run up a new one to access
our existing credentials and avoid having to log in again.

There. Don't you feel better about life already? If only I'd done
something like this earlier, I could've avoided writing
[this](/post/installing-travis-cli/) post.

The same sort of method should work perfectly well for other
command-line tools like
[Amazon's][aws-cli]{target="_blank"}, [Heroku's][heroku-cli]{target="_blank"},
[Travis CI's][travis-cli]{target="_blank"}, and so on.
Google [Cloud SDK][google-cli]{target="_blank"} and [Amazon's][aws-docker]{target="_blank"}
command-line tools are the only ones I've noticed where the provider
actually [tells users][gcloud-docker]{target="_blank"}
[about the method][aws-docker]{target="_blank"}
described here as an alternative to installing a godawful bunch of packages just to manage something in the cloud.
But I like to think that if enough of us join together, in a spirit
of good-will and positivity, and yell at cloud providers to fix their shit
up, then maybe someday the others will too.


[heroku-cli]: <https://devcenter.heroku.com/articles/heroku-cli>
[digitalocean-cli]: <https://github.com/digitalocean/doctl/blob/master/README.md#snap-supported-os>
[snap-mint]: <https://lwn.net/Articles/825005/>
[snap-malware]: <https://news.ycombinator.com/item?id=17055401>
[snap]: <https://www.helpnetsecurity.com/2019/02/13/cve-2019-7304/>
[aws-cli]: <https://aws.amazon.com/cli/>
[aws-locations]: <https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2-linux.html#cliv2-linux-install>
[sap-install]: <https://help.sap.com/viewer/65de2977205c403bbc107264b8eccf4b/Cloud/en-US/8a8f17f5fd334fb583438edbd831d506.html#loio8a8f17f5fd334fb583438edbd831d506>
[sap-license]: </images/azure-in-docker--germany.png>
[google-install]: <https://cloud.google.com/sdk/install#installation_options>
[aliyun-install]: <https://www.alibabacloud.com/help/doc-detail/121541.htm>
[aliyun-github]: <https://github.com/aliyun/aliyun-cli>
[az-cloud-shell]: <https://www.infoq.com/articles/azure-cloud-shell/>

[webssh2]: https://www.npmjs.com/package/webssh2

[docker]: <https://www.docker.com/>
[baroque]: <https://coreos.com/rkt/docs/latest/rkt-vs-other-projects.html#process-model>
[rube]: <https://media.rubegoldberg.com/site/wp-content/uploads/2019/04/hachathon-1200x674.jpg>
[goldberg]: <https://news.ycombinator.com/item?id=9963242>
[esque]: <https://levelup.gitconnected.com/how-docker-authentication-works-by-documentation-mitm-and-implementation-e62cd7a31178#9bf4>
[kudzu]: <https://www.smithsonianmag.com/science-nature/true-story-kudzu-vine-ate-south-180956325/>

[exploring-mcr]: <https://jeeweetje.net/2019/07/10/exploring-containers-in-the-microsoft-container-registry-with-visual-studio-code/>
[ras-syndrome]: <https://en.wikipedia.org/wiki/RAS_syndrome>
[no-ms-browsing]: <https://github.com/microsoft/containerregistry#faq>



[ballmer-changed]: <https://www.zdnet.com/article/ballmer-i-may-have-called-linux-a-cancer-but-now-i-love-it/>
[linux-cancer]: <https://www.theregister.com/2001/06/02/ballmer_linux_is_a_cancer/>
[linux-communism]: <https://www.theregister.com/2000/07/31/ms_ballmer_linux_is_communism/>
[eex]: <https://en.wikipedia.org/wiki/Embrace,_extend,_and_extinguish>

[^anon-vols]: In the tradition of IT people giving things [terrible]{target="_blank"} [names]{target="_blank"},
  anonymous volumes are not actually anonymous (though they are
  volumes). They just are given a [randomly-generated][random-name]{target="_blank"} name
  when created -- something euphonious and pleasant to read like
  <code style="word-break: break-word">71bc263a17ab4233d9d966c42bdb060c026ce6531c00fa5a7b7329834fe01914000000000000000000</code> for
  instance.

[terrible]: <https://martinfowler.com/bliki/TwoHardThings.html>
[names]: <https://alexene.dev/2020/08/17/webassembly-without-the-browser-part-1.html#what-is-webassembly>
[random-name]: <https://docs.docker.com/storage/#more-details-about-mount-types>

[travis-cli]: <https://github.com/travis-ci/travis-ci/issues/2055>
[gcloud-docker]: <https://hub.docker.com/r/google/cloud-sdk/>
[google-cli]: <https://cloud.google.com/sdk>

<!--
https://github.com/travis-ci/travis.rb#readme
-->
[aws-docker]: <https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2-docker.html#cliv2-docker-share-files>


{# vim: syntax=markdown :
#}
