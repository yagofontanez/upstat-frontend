(function () {
  const SLUG = document.currentScript.getAttribute("data-slug");
  const API =
    document.currentScript.getAttribute("data-api") ||
    "https://api.upstat.online";

  if (!SLUG) return;

  const STATUS_CONFIG = {
    operational: {
      label: "Todos operacionais",
      color: "#22C55E",
      bg: "#0D1117",
      border: "rgba(34,197,94,0.2)",
      dot: "#22C55E",
    },
    degraded: {
      label: "Desempenho degradado",
      color: "#F59E0B",
      bg: "#0D1117",
      border: "rgba(245,158,11,0.2)",
      dot: "#F59E0B",
    },
    down: {
      label: "Sistema offline",
      color: "#EF4444",
      bg: "#0D1117",
      border: "rgba(239,68,68,0.2)",
      dot: "#EF4444",
    },
  };

  function createWidget(data) {
    const existing = document.getElementById("upstat-widget");
    if (existing) existing.remove();

    const config = STATUS_CONFIG[data.overall] || STATUS_CONFIG.operational;

    const wrapper = document.createElement("div");
    wrapper.id = "upstat-widget";
    wrapper.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 99999;
      font-family: 'JetBrains Mono', 'Courier New', monospace;
      animation: upstat-fadein 0.4s ease both;
    `;

    const style = document.createElement("style");
    style.textContent = `
      @keyframes upstat-fadein {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes upstat-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.4; }
      }
      #upstat-widget a {
        display: flex;
        align-items: center;
        gap: 8px;
        background: ${config.bg};
        border: 1px solid ${config.border};
        border-radius: 100px;
        padding: 8px 14px;
        text-decoration: none;
        box-shadow: 0 4px 24px rgba(0,0,0,0.4);
        transition: transform 0.15s, box-shadow 0.15s;
        cursor: pointer;
      }
      #upstat-widget a:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 32px rgba(0,0,0,0.5);
      }
      #upstat-widget .upstat-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: ${config.dot};
        flex-shrink: 0;
        animation: ${data.overall === "down" ? "upstat-pulse 1.5s infinite" : "none"};
      }
      #upstat-widget .upstat-label {
        font-size: 12px;
        font-weight: 600;
        color: ${config.color};
        white-space: nowrap;
      }
      #upstat-widget .upstat-divider {
        width: 1px;
        height: 12px;
        background: rgba(255,255,255,0.08);
        flex-shrink: 0;
      }
      #upstat-widget .upstat-brand {
        font-size: 10px;
        color: #555;
        white-space: nowrap;
      }
    `;

    const link = document.createElement("a");
    link.href = `https://upstat.online/status/${SLUG}`;
    link.target = "_blank";
    link.rel = "noreferrer";

    const dot = document.createElement("span");
    dot.className = "upstat-dot";

    const label = document.createElement("span");
    label.className = "upstat-label";
    label.textContent = config.label;

    const divider = document.createElement("span");
    divider.className = "upstat-divider";

    const brand = document.createElement("span");
    brand.className = "upstat-brand";
    brand.textContent = "● UpStat";

    link.appendChild(dot);
    link.appendChild(label);
    link.appendChild(divider);
    link.appendChild(brand);
    wrapper.appendChild(style);
    wrapper.appendChild(link);
    document.body.appendChild(wrapper);
  }

  function fetchAndRender() {
    fetch(`${API}/widget/${SLUG}`)
      .then((res) => res.json())
      .then((data) => createWidget(data))
      .catch(() => {});
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fetchAndRender);
  } else {
    fetchAndRender();
  }

  setInterval(fetchAndRender, 60000);
})();
