import { mount } from 'svelte';
import App from './App.svelte';

const appEl = document.getElementById('app')!;

const app = mount(App, {
  target: appEl,
});

// Steal focus from Chrome's address bar into the page
function stealFocus() {
  appEl.focus();
}
stealFocus();
requestAnimationFrame(stealFocus);
setTimeout(stealFocus, 0);
setTimeout(stealFocus, 100);
setTimeout(stealFocus, 300);

export default app;
