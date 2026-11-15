(function () {
  'use strict';
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  const navigation = document.getElementById('tool-navigation');
  const toggle = document.getElementById('nav-toggle');
  const header = document.querySelector('.site-navigation');
  function syncHeader() { header.classList.toggle('is-scrolled', window.scrollY > 0); }
  window.addEventListener('scroll', syncHeader, {passive:true});
  syncHeader();
  let expanded = false;
  function selected() {
    return tabs.find((tab) => tab.getAttribute('aria-selected') === 'true');
  }
  function setMenu(open, restoreFocus = false) {
    expanded = open;
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.setAttribute('aria-label', expanded ? 'Close navigation' : 'Open navigation');
    navigation.dataset.menuOpen = String(expanded);
    navigation.hidden = !expanded;
    if (restoreFocus) toggle.focus({ preventScroll: true });
  }
  navigation.setAttribute('aria-orientation', 'vertical');
  setMenu(false);
  toggle.addEventListener('click', () => {
    setMenu(!expanded);
    if (expanded) {
      const tab = selected();
      tabs.forEach((item) => {
        item.tabIndex = item === tab ? 0 : -1;
      });
      tab.focus({ preventScroll: true });
      navigation.scrollTop = Math.max(
        0,
        tab.offsetTop - navigation.clientHeight / 2 + tab.offsetHeight / 2
      );
    }
  });
  document.addEventListener('keydown', (event) => {
    if (expanded && event.key === 'Escape') {
      event.preventDefault();
      setMenu(false, true);
    }
  });
  document.addEventListener('click', (event) => {
    if (!expanded || navigation.contains(event.target) || toggle.contains(event.target))
      return;
    const restoreFocus = navigation.contains(document.activeElement);
    setMenu(false, restoreFocus);
  });
  navigation.addEventListener('focusout', (event) => {
    if (
      expanded &&
      event.relatedTarget &&
      !navigation.contains(event.relatedTarget) &&
      event.relatedTarget !== toggle
    )
      setMenu(false);
  });
  function activate(tab) {
    for (const item of tabs) {
      const selected = item === tab;
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
      document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
    }
    setMenu(false);
    document.body.classList.toggle('home-active', tab.id === 'home-tab');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  window.AnalysisTabs = {
    activate(id, { focusPanel = false } = {}) {
      const tab = tabs.find((item) => item.id === id);
      if (!tab) return;
      activate(tab);
      if (focusPanel) {
        const panel = document.getElementById(tab.getAttribute('aria-controls'));
        panel.focus({ preventScroll: true });
      }
    },
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      activate(tab);
      document
        .getElementById(tab.getAttribute('aria-controls'))
        .focus({ preventScroll: true });
    });
    tab.addEventListener('keydown', (event) => {
      let next;
      if (event.key === 'ArrowDown') next = tabs[(index + 1) % tabs.length];
      if (event.key === 'ArrowUp') next = tabs[(index + tabs.length - 1) % tabs.length];
      if (event.key === 'ArrowRight') next = tabs[(index + 1) % tabs.length];
      if (event.key === 'ArrowLeft') next = tabs[(index + tabs.length - 1) % tabs.length];
      if (event.key === 'Home') next = tabs[0];
      if (event.key === 'End') next = tabs[tabs.length - 1];
      if (!next) return;
      event.preventDefault();
      tabs.forEach((item) => {
        item.tabIndex = item === next ? 0 : -1;
      });
      next.focus();
    });
  });
})();
