import { progress } from './progress';

/** Downloads progress as a JSON file and records the export time. */
export function downloadProgress() {
  progress.flush();
  const url = URL.createObjectURL(new Blob([progress.export()], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'learnhtml-progress.json';
  a.click();
  URL.revokeObjectURL(url);
  progress.markExported();
}
