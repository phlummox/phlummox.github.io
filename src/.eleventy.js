// .eleventy.js in the project root

const yaml = require("js-yaml");
//const pluginYamldata = require("eleventy-plugin-yamldata");

const fs = require('fs');

const isProduction = process.env.ELEVENTY_ENV === 'production';

// nice formatting of dates and times
const moment = require('moment');
moment.locale('en-GB');

// nice shortcode for excerpts/teasers
// see https://www.jonathanyeong.com/garden/excerpts-with-eleventy/
const striptags = require("striptags");
//const excerpt = require('eleventy-plugin-excerpt');
const stringstrip = require("string-strip-html");

const excerpt_length = 200;

function extractExcerpt(article) {
  if (!article.hasOwnProperty("templateContent")) {
    console.warn(
      'Failed to extract excerpt: Document has no property "templateContent".'
    );
    return null;
  }

  let excerpt = null;
  const content = article._templateContent;

  // `script`, `style` and `xml` tags
  // are stripped _with_ their content
  excerpt = stringstrip.stripHtml(content, {
      stripTogetherWithTheirContents: [
        "script", // default
        "style",  // default
        "xml",    // default
        "sup",    // <-- custom-added
        "sub"
      ]
  }).result
    .substring(0, excerpt_length) // Cap length
    .replaceAll(/\s+/g, " ")
    .trim()
    .concat("...");
  return excerpt;
}

function stripTitle(title) {
  result = stringstrip.stripHtml(title).result
    .replace(/^\s+|\s+$|\s+(?=\s)/g, "")
    .trim()
  return result;
}


module.exports = function(eleventyConfig) {
  // Customizations go here

  console.log("whether using production env:", isProduction);

  ////
  // date plugin

  eleventyConfig.addFilter('dateIso', date => {
    return moment(date).toISOString();
  });

  eleventyConfig.addFilter('dateReadable', date => {
    return moment(date).utc().format('LL'); // E.g. 31 May 2019
  });

  eleventyConfig.addFilter('dateTimeReadable', date => {
    return moment(date).utc().format('LLLL'); // as above but w/ time
  });

  ////
  // nice legal titles
  eleventyConfig.addFilter("stripTitle", (title) => stripTitle(title));

  ////
  // page excerpts (teasers)

  //eleventyConfig.setFrontMatterParsingOptions({
  //  excerpt: true,
  //  excerpt_separator: "<!-- excerpt -->"
  //});
  //eleventyConfig.addPlugin(excerpt);
  eleventyConfig.addShortcode("excerpt", (article) => extractExcerpt(article));

  ////
  // debugging

  eleventyConfig.addFilter("stringify", function(value) {
    return JSON.stringify(value);
  });

  eleventyConfig.addFilter("inspect", function(value) {
    console.log("typeof value is: ", typeof(value));
    console.log("stringified value is: ", JSON.stringify(value));
    console.log("raw value is: ", value);
  });

  ////
  // utility filters and shortcodes

  eleventyConfig.addFilter("only_normal_tags", function(arr) {
    return arr.filter(el => el !== 'post' && el !== 'all');
  });

  eleventyConfig.addFilter("concatNotNull", function(arr) {
    var res = [];
    for(i = 0; i < arr.length; i=i+1) {
      if (arr[i] != null) {
        res = res.concat(arr[i]);
      }
    }
    return res;
  });

  eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);

  eleventyConfig.addGlobalData("currentDate", new Date());

  ////
  // markdown-it package and plugins

  // adjust ugly default rendering of footnote refs:
  // adapted from https://github.com/markdown-it/markdown-it-footnote/blob/3.0.3/index.js
  function render_footnote_caption(tokens, idx/*, options, env, slf*/) {
    var n = Number(tokens[idx].meta.id + 1).toString();
    if (tokens[idx].meta.subId > 0) {
      n += ':' + tokens[idx].meta.subId;
    }
    return '' + n + '';
  }

  let markdownIt          = require("markdown-it");
  // Allow classes, identifiers and attributes in braces
  // e.g. {.class #identifier attr=value attr2="spaced value"}
  let markdownItAttrs     = require("markdown-it-attrs");
  let markdownItAnchor    = require("markdown-it-anchor");
  //let markdownItHeadings  = require("markdown-it-github-headings");
  //
  let markdownItFancyList = require("markdown-it-fancy-lists").markdownItFancyListPlugin;
  let markdownItFootnotes = require('markdown-it-footnote');
  let markdownItDiv       = require('markdown-it-div');

  let options = {
    html: true,        // Enable HTML tags in source
    linkify: true,     // autoconvert URL-like text to links
    typographer: true  // quote beautification
  };

  let markdownLib = markdownIt(options)
                      .use(markdownItAttrs)
                      .use(markdownItFootnotes)
                      .use(markdownItDiv)
                      .use(markdownItFancyList)
                      .disable('code');
  markdownLib.renderer.rules.footnote_caption = render_footnote_caption

  eleventyConfig.setLibrary("md", markdownLib);

  //// add our own "markdownify" filter
  //eleventyConfig.addFilter("markdownify", function(value) {
  //  return markdownLib(value);
  //});

  /////
  // add RSS plugin
  let rssPlugin = require("@11ty/eleventy-plugin-rss");
  eleventyConfig.addPlugin(rssPlugin);

  ////
  // Allow YAML data files

  eleventyConfig.addDataExtension("yaml", contents => yaml.load(contents));

  ////
  // Copy over assets

  copy_config = {};

  // This will copy these folders to the output without modifying them at all
  var asset_dirs = ['css', 'fonts', 'images', 'js'];
  for (const dir of asset_dirs) {
    const src_dir = "/assets/" + dir;
    if (! fs.existsSync(src_dir) ) {
      console.log("warning: assets dir " + src_dir + " does not exist");
    }
    const dst_dir = dir;
    console.log("adding " + src_dir + ", dst " + dst_dir);
    copy_config[src_dir] = dst_dir;
  }

  eleventyConfig.addPassthroughCopy( copy_config );

  ////
  // post-processing:
  // - validate HTML using html tidy
  // - do markdown header navigation/permalinks
  const execa = require('execa');

  // if wanting to do postprocessing on the
  // output (e.g. adding links/anchors next to headers)
  // add them below in the spot indicated.
  //
  // We also run `tidy` to check for errors: the
  // build will fail if the HTML produced can't be parsed.

  eleventyConfig.addTransform("headernav", function(content, outputPath) {
    console.log("\nheadernav. outputPath:", outputPath);

    // validate HTML output using `tidy`.
    if( this.outputPath && this.outputPath.endsWith(".html") ) {
      let outputPath = this.outputPath;
      console.log("executing 'tidy'");
      try {
        execa.commandSync('tidy -q -e -utf8', {
          timeout: 1000 * 4,
          input: content
      });
      } catch (err) {
        if (err.exitCode && err.exitCode == 0) {
          console.log("tidy: " + outputPath + " OK");
        } else if (err.exitCode && err.exitCode == 1) {
          console.log("tidy: " + outputPath + " produced warnings:", err.shortMessage);
          console.log("stderr was: ", err.stderr);
        } else {
          console.log("\n\nfailed running tidy on", outputPath, err.shortMessage );
          console.log("content start was: ",  content.substring(0, 100) );
          throw new Error('failed running tidy on ' + outputPath + ", " + err.toString(), { cause: err });
        }
      }

      const {parse, HTMLElement, TextNode}
                        = require('node-html-parser');
      const root        = parse(content, {
                            comment: true,
                            blockTextElements: {
                              script: true,
                              noscript: true,
                              style: true,
                              pre: true
                            }
                          });

      // TRANSFORMS HAPPEN HERE

      return root.toString();
    } else {
      return content;
    }
  })

  /// modify global data.
  // bit hackish - uses hardcoded port 8080
  // TODO: check actual port
  if (! isProduction) {
    eleventyConfig.addGlobalData("siteinfo.site_url", "http://localhost:8080/");
  }

  ////
  // eleventy options

  return {
    // When a passthrough file is modified, rebuild the pages:
    passthroughFileCopy: true,
    dir: {
      input: "/src",
      includes: "_includes",
      layouts: "_layouts",
      //data: "_data",
      output: "/out/_site/"
    },
    // use nunjucks for everything:
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",
    // use this to shift base url if
    // deploying to somewhere below root (/)
    pathPrefix: isProduction ? '/' : '/'
  };
}

