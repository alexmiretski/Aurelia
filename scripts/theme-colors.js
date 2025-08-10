(function () {
  // Slightly darkened theme palette
  const themeColors = {
    dream: '#ccaade',
    feel: '#dca2b4',
    wonder: '#b292d9',
    remember: '#dcc5b3',
    reflect: '#948cba',
    observe: '#d9d1ab',
    drift: '#a7cabd',
    ache: '#c59393',
    evolution: '#e5e5e5'
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
