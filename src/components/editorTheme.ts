import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { EditorView } from '@codemirror/view';
import { tags as t } from '@lezer/highlight';

/** A near-black editor theme with high-contrast syntax colours, used in both app themes. */
const c = {
  bg: '#0b0b10',
  text: '#e8e8f0',
  muted: '#6b6f85',
  gutterText: '#565a6e',
  activeLine: '#16161f',
  selection: '#2b3a5c',
  caret: '#ff7a50',
};

const view = EditorView.theme(
  {
    '&': { color: c.text, backgroundColor: c.bg },
    '.cm-content': {
      caretColor: c.caret,
      fontFamily: "ui-monospace, 'JetBrains Mono', 'SF Mono', Menlo, Consolas, monospace",
      lineHeight: '1.65',
      padding: '10px 0',
    },
    '.cm-cursor, .cm-dropCursor': { borderLeftColor: c.caret, borderLeftWidth: '2px' },
    '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, ::selection':
      { backgroundColor: `${c.selection} !important` },
    '.cm-activeLine': { backgroundColor: c.activeLine },
    '.cm-gutters': { backgroundColor: c.bg, color: c.gutterText, border: 'none', borderRight: '1px solid #1d1d28' },
    '.cm-activeLineGutter': { backgroundColor: c.activeLine, color: '#b9bccc' },
    '.cm-foldPlaceholder': { backgroundColor: '#1d1d28', border: 'none', color: c.muted },
    '.cm-matchingBracket, &.cm-focused .cm-matchingBracket': { backgroundColor: '#2a2a3a', outline: '1px solid #4a4a60' },
    '.cm-searchMatch': { backgroundColor: '#5a4a1a', outline: '1px solid #8a7330' },
    '.cm-tooltip': { backgroundColor: '#16161f', border: '1px solid #2a2a3a', color: c.text },
    '.cm-tooltip-autocomplete > ul > li[aria-selected]': { backgroundColor: c.selection, color: c.text },
    '.cm-panels': { backgroundColor: '#16161f', color: c.text },
  },
  { dark: true },
);

const highlight = HighlightStyle.define([
  { tag: [t.tagName, t.standard(t.tagName)], color: '#ff9e7a' },
  { tag: t.attributeName, color: '#f2c46d' },
  { tag: [t.attributeValue, t.string, t.special(t.string)], color: '#a5e59a' },
  { tag: [t.angleBracket, t.punctuation, t.separator, t.bracket], color: '#8a8fa6' },
  { tag: [t.comment, t.blockComment, t.lineComment], color: '#7d8299', fontStyle: 'italic' },
  { tag: [t.documentMeta, t.processingInstruction, t.keyword, t.modifier], color: '#c9a2ff' },
  { tag: t.character, color: '#7fd4ff' },
  { tag: [t.number, t.bool, t.null, t.atom], color: '#ffb46b' },
  { tag: [t.propertyName, t.function(t.variableName), t.function(t.propertyName)], color: '#86b4ff' },
  { tag: [t.className, t.typeName], color: '#7fe0d0' },
  { tag: [t.operator, t.unit], color: '#d6d8e6' },
  { tag: t.invalid, color: '#ff6b6b', textDecoration: 'underline wavy' },
  { tag: t.content, color: '#e8e8f0' },
]);

export const editorTheme = [view, syntaxHighlighting(highlight)];
