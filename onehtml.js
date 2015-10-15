// onehtml.js
// 2015-10-05

// These Cyc rules produce a single HTML file.

/*jslint
    devel: true
*/

/*property
    $, aka, appendix, article, b, book, chapter, charCodeAt, create, end, es5,
    gen, i, level, link, name, program, replace, reserved, section, specimen,
    t, table, toLowerCase, toString, toUpperCase, url
*/

function make_onehtml() {
    'use strict';
    var h_bit = false,
        link_text = Object.create(null),
        nx = /\n|\r\n?/,
        sx = /[!-@\[-\^`{-~]/g,     // special characters & digits
        title = '';


    function entityify(text) {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    }


    function special_encode(text) {

// Convert the text to lower case, and then replace ASCII special characters
// with pairs of hex digits. This makes special character sequences safe for
// use as filenames and urls. Alpha hex characters will be upper case.

        if (typeof text === 'string') {
            return text.toLowerCase().replace(sx, function (a) {
                return a.charCodeAt(0).toString(16).toUpperCase();
            });
        }
    }

    function stuff_name(text, structure) {
        structure.name = text;
        link_text[structure.link.toLowerCase()] = text;
        return text;
    }

    function stuff_link(text, structure) {
        text = text.trim();
        structure.link = text;
        return text;
    }

    function wrap(tag) {
        return function (text, structure) {
            return '\n<' + tag + ' id="' + special_encode(structure.link) + 
                    '">' + text + '</' + tag + '>';
        };
    }

    return {
        '*': ['link', 'name', 'gen'],   // the names of the passes
        '@': function (product) {
            return '<!DOCTYPE html><html><head><meta charset="utf-8">' +
                    '<link rel="stylesheet" href="encyclopedia.css" type="text/css">' +
                    '<title>' + entityify(title) + '</title>' +
                    '</head><body>' + product.gen + '</body></html>';
        },
        $: {                            // the naked text rule
            name: entityify,
            gen: entityify
        },
        '': {                           // the default para rule
            link: '',
            name: '',
            gen: ["\n<p>", "</p>"]
        },
        aka: {
            link: '',
            name: ["<dfn>", "</dfn>"],
            gen: ["<dfn>", "</dfn>"]
        },
        appendix: {
            level: 2,
            link: stuff_link,
            name: stuff_name,
            gen: wrap("h1")
        },
        article: {
            level: 4,
            link: stuff_link,
            name: stuff_name,
            gen: wrap("h3")
        },
        b: {
            gen: ["<b>", "</b>"]
        },
        book: {
            level: 1,
            name: function (text) {
                title = text;
            },
            gen: wrap("h1")
        },
        chapter: {
            level: 2,
            link: stuff_link,
            name: stuff_name,
            gen: wrap("h1")
        },
        comment: {
            link: '',
            name: '',
            gen: ''
        },
        es5: {
            link: '',
            name: '',
            gen: ["\n<div class=es5>", "</div>"]
        },
        i: {
            gen: ["<i>", "</i>"]
        },
        link: {
            link: stuff_link,
            gen: function (ignore, structure) {
                var name = link_text[structure.link.toLowerCase()];
                if (name !== undefined) {
                    return "<a href=\"#" + special_encode(structure.link) + 
                            "\">" + name + "</a>";
                } else {
                    return structure.link + " <strong>MISSING LINK</strong>";
                }
            }
        },
        list: {
            name: '',
            link: '',
            gen: function (text) {
                return '<ul><li>' + text.split(nx).join('</li><li>') + '</li></ul>';
            }
        },
        program: {
            name: '',
            link: '',
            gen: ["\n<pre>", "</pre>"]
        },
        reserved: {
            name: '',
            link: '',
            gen: "<a href=\"#reserved word\"><strong>reserved word</strong></a>"
        },
        section: {
            level: 5,
            link: '',
            name: '',
            gen: wrap("h4")
        },
        specimen: {
            level: 3,
            link: stuff_link,
            name: stuff_name,
            gen: wrap("h2")
        },
        sub: {
            name: ["<sub>", "</sub>"],
            gen: ["<sub>", "</sub>"]
        },
        super: {
            name: ["<sup>", "</sup>"],
            gen: ["<sup>", "</sup>"]
        },
        t: {
            name: ["<tt>", "</tt>"],
            gen: ["<tt>", "</tt>"]
        },
        table: {
            link: '',
            name: '',
            gen: ["<table><tbody>", "</tbody></table>"],
            parse: function (structure) {
                var itemcont = [],
                    item = ['-td', itemcont],
                    rowcont = [item],
                    row = ['-tr', rowcont],
                    tablecont = [row],
                    table = ['table', tablecont];
                structure.slice(1).forEach(function (rowrow) {
                    rowrow.forEach(function (thing) {
                        if (Array.isArray(thing)) {
                            switch (thing[0]) {
                            case '@!':
                                item[0] = '-th';
                                break;
                            case '@|':
                                itemcont = [];
                                item = ['-td', itemcont];
                                rowcont.push(item);
                                break;
                            case '@_':
                                itemcont = [];
                                item = ['-td', itemcont];
                                rowcont = [item];
                                row = ['-tr', rowcont];
                                tablecont.push(row);
                                break;
                            default:
                                itemcont.push(thing);
                            }
                        } else {
                            itemcont.push(thing);
                        }
                    });
                });
                return table;
            },
            '@!': true,
            '@_': true,
            '@|': true
        },
        '-td': {
            link: '',
            name: '',
            gen: ["<td>", "</td>"]
        },
        '-th': {
            link: '',
            name: '',
            gen: ["<th>", "</th>"]
        },
        '-tr': {
            link: '',
            name: '',
            gen: ["<tr>", "</tr>"]
        },
        url: {
            gen: function (text) {
                return '<a href="' + text + '">' + text + '</a>';
            }
        }
    };
}

module.exports = make_onehtml();
