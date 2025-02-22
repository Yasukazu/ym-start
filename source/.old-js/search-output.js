//@ts-check
export { SearchOutput, getFirstNChars, startsFromDate };

class SearchOutput {
  /**
   * check container element of #search
   * @param {{id: string, heading: string, entries: string}}search_result_container_map
   * @param {{id: string, title: string, date: string, content: string}} search_result_entry_map
   */
  constructor(search_result_container_map, search_result_entry_map) {
    this.search_result_container_map = search_result_container_map;
    this.search_result_entry_map = search_result_entry_map;
    this.search_result_entry = document.querySelector(`#${search_result_entry_map.id}`);
    if (!(this.search_result_entry)) {
      throw Error(`search_result_entry is not available.`);
    }
    this.search_result_container = document.querySelector(search_result_container_map.id);
    if (!(this.search_result_container instanceof HTMLElement))
      throw Error(`${search_result_container_map.id} is unavailable`);
    // get heading slot 
    let _query = `[slot=${search_result_container_map.heading}]`;
    let old_element = this.search_result_container.querySelector(_query);
    if(old_element instanceof Element) {
      // remove old heading
      const removed = this.search_result_container.removeChild(old_element);
      console.assert(removed instanceof Element, `old_heading removed : ${removed}`);
    }

    // remove old entries li
    _query = `[slot=${search_result_container_map.entries}]`;
    old_element = this.search_result_container.querySelector(_query);
    if (old_element instanceof Element) {
      const removed = this.search_result_container.removeChild(old_element);
      console.assert(removed instanceof Element, `${removed}`);
    }
    this.added_count = 0;
  }

  /**
   * @param { {url: string, title: string, content: string, ii: Array<number>} }
   */
  addSearchResult({ url, title, content, ii}) {
    /** @type {DocumentFragment} */
    const entry_output = document.importNode(this.search_result_entry.content, true);
    console.assert(entry_output instanceof DocumentFragment);
    const entry_items = entry_output.querySelectorAll(`[class|='entry']`);
    console.assert(entry_items.length > 0)
    for (const entry of entry_items) {
      console.assert(entry instanceof Element);
      const cls = entry.getAttribute('class');
      console.assert(typeof(cls) === 'string')
      const split = cls.split('-');
      console.assert(split.length > 1);
      const item = split[1];
      switch (item) {
        case 'url':
          entry.setAttribute('href', url);
          break;
        case 'title':
          entry.innerHTML = title;
          break;
        case 'content':
          let length = 300;
          const data_length = entry.getAttribute('data-length');
          if (data_length) {
            const _length = parseInt(data_length);
            if (!isNaN(_length))
              length = _length;
            else
              console.warn('data-length is invalid.');
          }
          content = getFirstNChars(content, length);
          entry.innerHTML = mark_text(content, ii);
          break;
        case 'date':
          const url_date = getDate(url);
          if (url_date)
            entry.innerHTML = url_date;
          else
            console.error(`get date failed!`);
          break;
        default:
          console.warn(`Unexpected item key!`);
          break;
      }
    }
    // const slot_element = entry_output.querySelector(`[class='${this.search_result_entry_map.id}']`);
    const slot_element = entry_output.children[0];
    console.assert(slot_element instanceof HTMLElement);
    const slot_attribute = slot_element.getAttribute('slot');
    console.assert(slot_attribute === this.search_result_container_map.entries);
    let appended = this.search_result_container.appendChild(entry_output);
    console.assert(appended instanceof DocumentFragment, `${entry_output}`)
    this.added_count += 1;

  }

  /**
   * @returns {number}
   *  */ 
  get count() {return this.added_count;}

  /**
   * Add new heading
   * @param {string} msg 
   */
  addHeading(msg) {
    let new_span = document.createElement('span');
    console.assert(new_span instanceof Element)
    new_span.setAttribute('slot', this.search_result_container_map.heading);
    new_span.innerText = msg;
    const result = this.search_result_container.appendChild(new_span);
    console.assert(result instanceof Element, `${new_span}`)
  }

}

/**
 * 
 * @param {string} src 
 * @param {Number} n 
 * @returns {string}
 */
function getFirstNChars(src, n, trailing = '...') {
  const array = Array.from(src); // every code point
  let lc = '';
  let i = 0;
  let out = '';
  let on_break = false;
  for (let c of array) {
    if (lc === ' ' && lc === c) {
      continue;
    }
    else {
      lc = c;
    }
    out += c;
    if (++i >= n) {
      on_break = true;
      break;
    }
  }
  return out + (on_break ? trailing : '');
}

/**
 * Check url string represents a valid date
 * @param {string} url 
 * @returns {string}
 */
function startsFromDate(url) {
  const re = /(\d\d\d\d)\/(\d\d)\/(\d\d)/;
  const date = re.exec(url);
  if (date && date.length > 3) {
    const dt = [date[1], date[2], date[3]].join('-');
    const dateNum = Date.parse(dt);
    if (!isNaN(dateNum))
      return dt;
  }
  return '';
}

/**
 * 
 * @param {string} url 
 * @returns {string|undefined}
 */
function getDate(url) {
  const date_re = /(\d\d\d\d)\/(\d\d)\/(\d\d)/;
  const date = date_re.exec(url);
  if (date && date.length > 3) {
    const dt = [date[1], date[2], date[3]].join('-');
    const dateNum = Date.parse(dt);
    if (!isNaN(dateNum))
      return dt;
  }
}

/**
 * 
 * @param {string} text 
 * @param {Array<number>} start_end 
 * @returns {string}
 */
function mark_text(text, start_end, mark_start = "<mark>", mark_end = "</mark>") {
  if (start_end.length < 2)
    return text;
  const before_mark = text.slice(0, start_end[0]);
  const inside_mark = text.slice(start_end[0], start_end[1]);
  const after_mark = text.slice(start_end[1]);
  return before_mark + mark_start + inside_mark + mark_end + after_mark;
}