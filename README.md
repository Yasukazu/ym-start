# ym-start

テンプレートエンジンPug で Hexo のテーマを作る ひな形の _hexo-theme-starter_ の _ym-branch_ です。スタイルシート を含みます。

This is my branch of the template for making a theme of Hexo with Pug. 

## 実装済みのレイアウト（Implemented Layout）

- index
- post
- page
- archive
- tag page
- category page
- pagination

## 必要なプラグイン (Necessary plugins)

- hexo-renderer-pug
- hexo-generator-search

## サイト内全文検索 (In-site full-text search)
`themes/ym-start/layout/_include/header.pug` contains templates for search result output.
```pug
template#search-result-container
  div.search-result-container
    h2.heading Search result
    ul.entries

template#search-result-entry
  li.search-result-entry
    a.title
    time.date
    p.content
```
These templates use a script file of `themes/ym-start/source/js/search.js`.
Don't change tag names and their class names except `h2`, `time` and `p` tags.

### Ignore Unicode Combining Characters(accents) in search
Using normalize('NFKD')

- Also Japanese _dakuten_ and _handakuten_

```javascript
/**
 * 
 * @param {Document} document // XML
 * @param {string} query_str // Regex expression
 * @returns {Array<Element>}
 */
function analyzeData(document, query_str) {
  const entries = document.getElementsByTagName('entry');
  const matchEntries = [];
  const normalized_query = query_str.normalize('NFKD');
  const combining_chars_regex = /\p{Mark}/gu;
  const query = normalized_query.replace(combining_chars_regex, '');
  const query_regex = RegExp(query);
  const test_children = [0, 2];
  for (var entry of entries) {
    let match = false;
    let content = '';
    for (var cn of test_children) {
      let _content = entry.children[cn]?.textContent;
      if (_content)
        content = _content.normalize('NFKD').replace(combining_chars_regex, "");
      if (query_regex.test(content)) {
        match = true;
        break;
      }
    }
    if (match)
      matchEntries.push(entry);
  }
  return matchEntries;
}
```