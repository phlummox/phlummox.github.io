---
title: "Post tags"
layout: base-layout.njk
---

# Tags

{% for tag, postlist in (collections | dictsort) %}
{%- if (tag != "post") and (tag != "all") -%}
<a href="{{ ('/tags/' + tag) | url }}">{{ tag }}</a><br>
{%- endif -%}
{% endfor %}


{# vim: syntax=markdown :
#}
