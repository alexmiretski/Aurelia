(function () {
  const themeColors = {
    dream: '#dba1f9',
    feel: '#f799b5',
    wonder: '#b786f5',
    remember: '#f6ccad',
    reflect: '#9082cf',
    observe: '#f3e5a5',
    drift: '#a2dfc8',
    ache: '#db8a8a',
    evolution: '#ffffff'
  };

  function setCssVariables() {
    const root = document.documentElement;
    for (const [theme, color] of Object.entries(themeColors)) {
      root.style.setProperty(`--theme-${theme}`, color);
    }
  }

  function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
  }

  function getThemeColor(theme) {
    return themeColors[theme];
  }

  function getThemeColorWithOpacity(theme, opacity = 1) {
    const hex = themeColors[theme];
    if (!hex) return '';
    return `rgba(${hexToRgb(hex)}, ${opacity})`;
  }

  function setFabHoverColors() {
    document.querySelectorAll('#fab-menu button[data-theme]').forEach(btn => {
      const theme = btn.dataset.theme;
      btn.style.setProperty('--fab-hover-color', getThemeColorWithOpacity(theme, 0.4));
    });
  }

  window.themeColors = themeColors;
  window.getThemeColor = getThemeColor;
  window.getThemeColorWithOpacity = getThemeColorWithOpacity;

  setCssVariables();
  setFabHoverColors();
})();
