import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { courseItems, courses, coursesIn, findItem } from '.';
import { itCourses, itMessages } from './it';
import { translateMessage } from '../i18n/messages';

/** Fenced code blocks: the "Try it" examples must stay the same in every language. */
const codeBlocks = (md: string) => md.match(/```[\s\S]*?```/g) ?? [];

describe('Italian translation', () => {
  for (const course of courses) {
    const text = itCourses[course.id];

    it(`${course.id}: translates every module`, () => {
      expect(Object.keys(text.modules).sort()).toEqual(course.modules.map((m) => m.id).sort());
    });

    for (const m of course.modules) {
      const mt = text.modules[m.id];
      describe(`${course.id}/${m.id}`, () => {
        it('translates every lesson and the challenge, and nothing else', () => {
          expect(Object.keys(mt?.items ?? {}).sort()).toEqual([...m.lessons, m.challenge].map((l) => l.id).sort());
        });

        for (const item of [...m.lessons, m.challenge]) {
          it(`${item.id}: same tasks, hints and code examples`, () => {
            const t = mt.items[item.id];
            expect(t.tasks.length, 'tasks').toBe(item.tasks.length);
            expect(t.hints.length, 'hints').toBe(item.hints.length);
            expect(codeBlocks(t.explanation)).toEqual(codeBlocks(item.explanation));
            if ('summary' in item) expect(t.summary, 'summary').toBeTruthy();
            for (const s of [t.title, t.explanation, ...t.tasks, ...t.hints]) expect(s.trim()).not.toBe('');
          });
        }
      });
    }
  }

  it('only translates messages that the lessons really use', () => {
    const unescape = (s: string) => s.replace(/\\(['"\\])/g, '$1');
    const sources = ['html', 'css', 'js']
      .flatMap((dir) => readdirSync(`src/content/${dir}`).filter((f) => /^\d\d-.*\.ts$/.test(f)).map((f) => `src/content/${dir}/${f}`))
      .map((f) => unescape(readFileSync(f, 'utf8')))
      .join('\n');
    const unknown = Object.keys(itMessages).filter((msg) => !sources.includes(msg));
    expect(unknown).toEqual([]);
  });

  it('keeps ids, code and checks, and changes only the words', () => {
    const it = coursesIn('it');
    for (const [k, course] of courses.entries()) {
      const en = courseItems(course);
      const tr = courseItems(it[k]);
      expect(tr.map((c) => c.item.id)).toEqual(en.map((c) => c.item.id));
      for (const [i, { item }] of tr.entries()) {
        const orig = en[i].item;
        expect(item.solution).toBe(orig.solution);
        expect(item.starterCode).toBe(orig.starterCode);
        expect(item.tasks.map((t) => t.check)).toEqual(orig.tasks.map((t) => t.check));
      }
    }
    expect(findItem('basics-first-tag', 'it')?.item.title).not.toBe(findItem('basics-first-tag')?.item.title);
  });

  it('translates the engine messages', () => {
    expect(translateMessage('Line 3: <p> (line 2) is never closed.', 'it')).toBe('Riga 3: <p> (riga 2) non viene mai chiuso.');
    expect(translateMessage('Expected at least 2 "h2", found 1.', 'it')).toBe('"h2": ne servono almeno 2, ce ne sono 1.');
    expect(translateMessage('Add a <p> paragraph.', 'it')).not.toBe('Add a <p> paragraph.');
    expect(translateMessage('Something nobody wrote.', 'it')).toBe('Something nobody wrote.');
    expect(translateMessage('Add a <p> paragraph.', 'en')).toBe('Add a <p> paragraph.');
  });
});
