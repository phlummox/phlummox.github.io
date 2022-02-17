---
layout: base-layout.njk
pagination:
  data: collections
  size: 1
  alias: tag
  reverse: true
  filter:
  - "all"
  - "post"
permalink: /tags/{{ tag }}/
eleventyComputed:
  title: "Posts tagged \"{{ tag }}\""
customStyle: |
  article {
    margin-top: 3.5em;
---

# Posts tagged "{{ tag }}"

{% set posts = collections[ tag ] | reverse %}

{%- from 'postslist_macro.njk' import postslist_macro -%}

{{ postslist_macro(page, posts, 'h2') }}

{# vim: syntax=markdown :
#}
