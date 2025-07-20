/**
 * @file HTML grammar for tree-sitter
 * @author Max Brunsfeld <maxbrunsfeld@gmail.com>
 * @author Amaan Qureshi <amaanq12@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: 'html',

  extras: $ => [
    $.comment,
    /\s+/,
  ],

  externals: $ => [
    $._start_tag_name,
    $._script_start_tag_name,
    $._style_start_tag_name,
    $._end_tag_name,
    $.erroneous_end_tag_name,
    '/>',
    $._implicit_end_tag,
    $.raw_text,
    $.comment,
  ],

  rules: {
    htmldocument: $ => repeat($.html_node),

    htmldoctype: $ => seq(
      '<!',
      alias($.html_doctype, "htmldoctype"),
      /[^>]+/,
      '>',
    ),

    html_doctype: _ => /[Dd][Oo][Cc][Tt][Yy][Pp][Ee]/,

    html_node: $ => choice(
      $.htmldoctype,
      $.htmlentity,
      $.htmltext,
      $.htmlelement,
      $.htmlscript_element,
      $.htmlstyle_element,
      $.htmlerroneous_end_tag,
    ),

    htmlelement: $ => choice(
      seq(
        $.htmlstart_tag,
        repeat($.html_node),
        choice($.htmlend_tag, $._implicit_end_tag),
      ),
      $.htmlself_closing_tag,
    ),

    htmlscript_element: $ => seq(
      alias($.htmlscript_start_tag, $.htmlstart_tag),
      optional($.raw_text),
      $.htmlend_tag,
    ),

    htmlstyle_element: $ => seq(
      alias($.htmlstyle_start_tag, $.htmlstart_tag),
      optional($.raw_text),
      $.htmlend_tag,
    ),

    htmlstart_tag: $ => seq(
      '<',
      alias($._start_tag_name, $.tag_name),
      repeat($.htmlattribute),
      '>',
    ),

    htmlscript_start_tag: $ => seq(
      '<',
      alias($._script_start_tag_name, $.tag_name),
      repeat($.htmlattribute),
      '>',
    ),

    htmlstyle_start_tag: $ => seq(
      '<',
      alias($._style_start_tag_name, $.tag_name),
      repeat($.htmlattribute),
      '>',
    ),

    htmlself_closing_tag: $ => seq(
      '<',
      alias($._start_tag_name, $.tag_name),
      repeat($.htmlattribute),
      '/>',
    ),

    htmlend_tag: $ => seq(
      '</',
      alias($._end_tag_name, $.tag_name),
      '>',
    ),

    htmlerroneous_end_tag: $ => seq(
      '</',
      $.erroneous_end_tag_name,
      '>',
    ),

    htmlattribute: $ => seq(
      $.htmlattribute_name,
      optional(seq(
        '=',
        choice(
          $.htmlattribute_value,
          $.htmlquoted_attribute_value,
        ),
      )),
    ),

    htmlattribute_name: _ => /[^<>"'/=\s]+/,

    htmlattribute_value: _ => /[^<>"'=\s]+/,

    // An entity can be named, numeric (decimal), or numeric (hexacecimal). The
    // longest entity name is 29 characters long, and the HTML spec says that
    // no more will ever be added.
    htmlentity: _ => /&(#([xX][0-9a-fA-F]{1,6}|[0-9]{1,5})|[A-Za-z]{1,30});?/,

    htmlquoted_attribute_value: $ => choice(
      seq('\'', optional(alias(/[^']+/, $.htmlattribute_value)), '\''),
      seq('"', optional(alias(/[^"]+/, $.htmlattribute_value)), '"'),
    ),

    htmltext: _ => /[^<>&\s]([^<>&]*[^<>&\s])?/,
  },
});
