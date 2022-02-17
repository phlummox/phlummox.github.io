---
title: "posts"
layout: base-layout.njk
pagination:
  data: collections.post
  size: 4
  reverse: true
  alias: posts
customStyle: |
  .post-item {
    margin-top: 3.5em;
  }
---

# Posts

{%- from 'postslist_macro.njk' import postslist_macro -%}

{{ postslist_macro(page, posts, 'h2') }}

{% include '_nav_arrows.njk' %}

{# vim: syntax=markdown :
#}
