---
title: "Home page"
layout: base-layout.njk
customStyle: |
  .post-item {
    margin-top: 2.5em;
  }
---

# Phlummox's blog

Random posts and musings. Usually on software development or computer science–related
topics.
<br><br>

## Some recent posts

Below are some recent blog posts. You can find [more posts here]({{ '/posts/' | url }}).

{% set sortedPosts = (collections.post | sortByDate | reverse) %}
{% set recentPosts = sortedPosts.slice(0,2) %}

{%- from 'postslist_macro.njk' import postslist_macro -%}

{{ postslist_macro(page, recentPosts, 'h3') }}

<a class="icon pages-icon" href="{{ '/posts/' | url }}" rel="next" aria-label="more posts" >
    <i class="fa fa-arrow-right"></i>
</a>

{# vim: syntax=markdown :
#}
