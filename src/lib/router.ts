import { useSyncExternalStore } from 'react';

export function parseHash(): { name: string; param?: string } {
  const h = (typeof location !== 'undefined' ? location.hash : '').replace(/^#\/?/, '');
  const [name, param] = h.split('/');
  return { name: name || 'home', param: param ? decodeURIComponent(param) : undefined };
}

function subscribe(cb: () => void) {
  window.addEventListener('hashchange', cb);
  return () => window.removeEventListener('hashchange', cb);
}

export function useRoute() {
  const hash = useSyncExternalStore(subscribe, () => location.hash);
  void hash;
  return parseHash();
}

export function go(name: string, param?: string) {
  location.hash = '/' + name + (param ? '/' + encodeURIComponent(param) : '');
  window.scrollTo({ top: 0 });
}
