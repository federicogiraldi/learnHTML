import { useEffect, useState } from 'react';

/**
 * Injected into the preview so same-page links scroll instead of navigating the iframe
 * to the app's own URL, and forms show what they would submit instead of leaving the page.
 */
const SHIM = `<script>
document.addEventListener('click', function (e) {
  var a = e.target.closest && e.target.closest('a[href]');
  if (!a) return;
  var href = a.getAttribute('href');
  e.preventDefault();
  if (href.charAt(0) === '#') {
    var t = document.getElementById(decodeURIComponent(href.slice(1)));
    if (t) t.scrollIntoView({ behavior: 'smooth' });
  } else {
    window.open(a.href, '_blank', 'noopener');
  }
});
document.addEventListener('submit', function (e) {
  e.preventDefault();
  var data = new FormData(e.target), lines = [];
  data.forEach(function (v, k) { lines.push(k + ' = ' + (typeof v === 'string' ? v : v.name)); });
  alert('Form submitted (preview only):\\n\\n' + (lines.join('\\n') || '(no named fields)'));
});
</script>`;

export function Preview({ code, title = 'Preview' }: { code: string; title?: string }) {
  const [doc, setDoc] = useState(code);
  useEffect(() => {
    const t = setTimeout(() => setDoc(code), 300);
    return () => clearTimeout(t);
  }, [code]);
  return (
    <iframe
      className="preview"
      title={title}
      sandbox="allow-scripts allow-forms allow-modals allow-popups"
      srcDoc={SHIM + doc}
    />
  );
}
