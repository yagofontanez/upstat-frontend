import { useEffect, useState } from "react";
import {
  Plus,
  X,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import {
  getServices,
  addDependency,
  removeDependency,
  type ExternalService,
} from "../services/dependencies";

const CATEGORY_LABELS: Record<string, string> = {
  payment: "Pagamento",
  hosting: "Hospedagem",
  ai: "IA",
  email: "Email",
  cdn: "CDN",
  communication: "Comunicação",
  devtools: "Dev Tools",
};

const INDICATOR_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; border: string }
> = {
  none: {
    label: "Operacional",
    color: "#22C55E",
    bg: "rgba(34,197,94,0.08)",
    border: "rgba(34,197,94,0.2)",
  },
  minor: {
    label: "Degradado",
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.2)",
  },
  major: {
    label: "Parcial",
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.2)",
  },
  critical: {
    label: "Fora do ar",
    color: "#EF4444",
    bg: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.2)",
  },
  unknown: {
    label: "Desconhecido",
    color: "#bbbbbbbb",
    bg: "rgba(255,255,255,0.04)",
    border: "rgba(255,255,255,0.08)",
  },
};

function getLogo(websiteUrl: string) {
  try {
    const domain = new URL(websiteUrl).hostname.replace("www.", "");
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  } catch {
    return null;
  }
}

function ServiceLogo({
  websiteUrl,
  name,
}: {
  websiteUrl: string;
  name: string;
}) {
  const logo = getLogo(websiteUrl);
  return logo ? (
    <img
      src={logo}
      alt={name}
      onError={(e) => {
        e.currentTarget.style.display = "none";
      }}
      style={{
        width: "22px",
        height: "22px",
        borderRadius: "5px",
        objectFit: "contain",
        background: "rgba(255,255,255,0.06)",
        padding: "2px",
        flexShrink: 0,
      }}
    />
  ) : null;
}

function StatusIndicator({ indicator }: { indicator: string | null }) {
  const cfg = INDICATOR_CONFIG[indicator ?? "none"] ?? INDICATOR_CONFIG.unknown;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        fontSize: "10px",
        padding: "2px 8px",
        borderRadius: "100px",
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        color: cfg.color,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: "5px",
          height: "5px",
          borderRadius: "50%",
          background: cfg.color,
          flexShrink: 0,
        }}
      />
      {cfg.label}
    </span>
  );
}

function ServiceCard({
  service,
  toggling,
  onToggle,
}: {
  service: ExternalService;
  toggling: string | null;
  onToggle: (s: ExternalService) => void;
}) {
  return (
    <div
      className="service-card"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        padding: "14px",
        background: service.is_dependency
          ? "rgba(0,212,170,0.04)"
          : "rgba(255,255,255,0.02)",
        border: `1px solid ${service.is_dependency ? "rgba(0,212,170,0.15)" : "rgba(255,255,255,0.05)"}`,
        borderRadius: "10px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "8px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            minWidth: 0,
          }}
        >
          <ServiceLogo websiteUrl={service.website_url} name={service.name} />
          <p
            style={{
              color: "#F0F6FC",
              fontSize: "13px",
              fontWeight: 700,
              margin: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {service.name}
          </p>
        </div>
        {service.is_dependency && (
          <span
            style={{
              fontSize: "9px",
              color: "#00D4AA",
              background: "rgba(0,212,170,0.08)",
              border: "1px solid rgba(0,212,170,0.15)",
              borderRadius: "4px",
              padding: "2px 6px",
              fontWeight: 700,
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            Ativo
          </span>
        )}
      </div>
      <button
        onClick={() => onToggle(service)}
        disabled={toggling === service.id}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "5px",
          background: service.is_dependency
            ? "rgba(239,68,68,0.08)"
            : "rgba(0,212,170,0.08)",
          border: `1px solid ${service.is_dependency ? "rgba(239,68,68,0.2)" : "rgba(0,212,170,0.2)"}`,
          borderRadius: "6px",
          padding: "6px",
          cursor: "pointer",
          color: service.is_dependency ? "#EF4444" : "#00D4AA",
          fontSize: "11px",
          fontWeight: 600,
          fontFamily: "'JetBrains Mono', monospace",
          opacity: toggling === service.id ? 0.5 : 1,
          transition: "all 0.15s",
          width: "100%",
        }}
      >
        {service.is_dependency ? (
          <>
            <X size={10} /> Remover
          </>
        ) : (
          <>
            <Plus size={10} /> Adicionar
          </>
        )}
      </button>
    </div>
  );
}

export function DependenciesPage() {
  const [services, setServices] = useState<ExternalService[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCatalog, setShowCatalog] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  async function fetchData() {
    const data = await getServices();
    setServices(data);
  }

  useEffect(() => {
    fetchData().finally(() => setLoading(false));
  }, []);

  async function handleToggle(service: ExternalService) {
    setToggling(service.id);
    try {
      if (service.is_dependency) {
        await removeDependency(service.id);
      } else {
        await addDependency(service.id);
      }
      await fetchData();
    } finally {
      setToggling(null);
    }
  }

  const myDeps = services.filter((s) => s.is_dependency);
  const categories = [...new Set(services.map((s) => s.category))];

  const filteredCatalog = services.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "all" || s.category === activeCategory;
    return matchSearch && matchCat;
  });

  const groupedCatalog = categories
    .filter((cat) => cat === activeCategory)
    .map((cat) => ({
      category: cat,
      services: filteredCatalog.filter((s) => s.category === cat),
    }))
    .filter((g) => g.services.length > 0);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "256px",
        }}
      >
        <div
          style={{
            width: "24px",
            height: "24px",
            border: "2px solid #00D4AA",
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .dep-fade { animation: fadeUp 0.35s ease both; }
        .dep-fade-1 { animation: fadeUp 0.35s 0.05s ease both; }
        .dep-fade-2 { animation: fadeUp 0.35s 0.1s ease both; }
        .service-card { transition: border-color 0.15s, background 0.15s; }
        .service-card:hover { border-color: rgba(255,255,255,0.1) !important; background: rgba(255,255,255,0.02) !important; }
        .cat-filter-btn { transition: all 0.15s; cursor: pointer; }
        .input-search:focus { border-color: #00D4AA !important; outline: none; box-shadow: 0 0 0 3px rgba(0,212,170,0.08); }
        .catalog-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
        .dep-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        @media (max-width: 1200px) { .catalog-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 1024px) { .catalog-grid { grid-template-columns: repeat(2, 1fr); } .dep-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 768px) { .catalog-grid { grid-template-columns: repeat(2, 1fr); } .dep-grid { grid-template-columns: 1fr; } }
        @media (max-width: 480px) { .catalog-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div
        className="dep-fade"
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "28px",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2
            style={{
              color: "#F0F6FC",
              fontSize: "22px",
              fontWeight: 700,
              letterSpacing: "-0.5px",
              margin: "0 0 4px",
            }}
          >
            Dependency Map
          </h2>
          <p style={{ color: "#bbbbbbbb", fontSize: "12px", margin: 0 }}>
            Monitore os serviços externos que sua stack depende
          </p>
        </div>
        <button
          onClick={() => setShowCatalog(!showCatalog)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: showCatalog ? "rgba(0,212,170,0.1)" : "#00D4AA",
            border: showCatalog ? "1px solid rgba(0,212,170,0.3)" : "none",
            borderRadius: "8px",
            padding: "8px 16px",
            cursor: "pointer",
            color: showCatalog ? "#00D4AA" : "#000",
            fontSize: "12px",
            fontWeight: 700,
            fontFamily: "'JetBrains Mono', monospace",
            transition: "all 0.2s",
          }}
        >
          {showCatalog ? <X size={14} /> : <Plus size={14} />}
          {showCatalog ? "Fechar catálogo" : "Adicionar serviço"}
        </button>
      </div>

      {showCatalog && (
        <div
          className="dep-fade"
          style={{
            background: "#0D1117",
            border: "1px solid rgba(0,212,170,0.15)",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "24px",
          }}
        >
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar serviço..."
            className="input-search"
            style={{
              width: "100%",
              background: "#060810",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "8px",
              padding: "9px 14px",
              color: "#F0F6FC",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "12px",
              boxSizing: "border-box",
              transition: "border-color 0.2s",
              marginBottom: "12px",
            }}
          />

          <div
            style={{
              display: "flex",
              gap: "6px",
              marginBottom: "16px",
              flexWrap: "wrap",
            }}
          >
            {["all", ...categories].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="cat-filter-btn"
                style={{
                  padding: "5px 12px",
                  borderRadius: "100px",
                  border: `1px solid ${activeCategory === cat ? "rgba(0,212,170,0.3)" : "rgba(255,255,255,0.06)"}`,
                  background:
                    activeCategory === cat
                      ? "rgba(0,212,170,0.08)"
                      : "transparent",
                  color: activeCategory === cat ? "#00D4AA" : "#bbbbbbbb",
                  fontSize: "11px",
                  fontWeight: activeCategory === cat ? 700 : 400,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {cat === "all" ? "Todos" : (CATEGORY_LABELS[cat] ?? cat)}
              </button>
            ))}
          </div>

          {activeCategory === "all" ? (
            <div className="catalog-grid">
              {filteredCatalog.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  toggling={toggling}
                  onToggle={handleToggle}
                />
              ))}
            </div>
          ) : (
            groupedCatalog.map(({ category, services: catServices }) => (
              <div key={category}>
                <p
                  style={{
                    fontSize: "10px",
                    color: "#333",
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                    margin: "0 0 10px",
                  }}
                >
                  {CATEGORY_LABELS[category] ?? category}
                </p>
                <div className="catalog-grid">
                  {catServices.map((service) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      toggling={toggling}
                      onToggle={handleToggle}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {myDeps.length === 0 ? (
        <div
          className="dep-fade-1"
          style={{
            background: "#0D1117",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "12px",
            padding: "56px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "rgba(0,212,170,0.06)",
              border: "1px solid rgba(0,212,170,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <AlertTriangle size={20} color="#00D4AA" />
          </div>
          <p
            style={{ color: "#bbbbbbbb", fontSize: "13px", margin: "0 0 12px" }}
          >
            Nenhuma dependência mapeada ainda.
          </p>
          <button
            onClick={() => setShowCatalog(true)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#00D4AA",
              fontSize: "13px",
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 600,
            }}
          >
            Adicionar serviço →
          </button>
        </div>
      ) : (
        <>
          {myDeps.some(
            (s) => s.current_indicator && s.current_indicator !== "none",
          ) ? (
            <div
              className="dep-fade-1"
              style={{
                background: "rgba(239,68,68,0.04)",
                border: "1px solid rgba(239,68,68,0.15)",
                borderRadius: "12px",
                padding: "14px 20px",
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <AlertTriangle size={14} color="#EF4444" />
              <span
                style={{ fontSize: "13px", color: "#EF4444", fontWeight: 600 }}
              >
                {
                  myDeps.filter(
                    (s) =>
                      s.current_indicator && s.current_indicator !== "none",
                  ).length
                }{" "}
                dependência(s) com problema
              </span>
            </div>
          ) : (
            <div
              className="dep-fade-1"
              style={{
                background: "rgba(0,212,170,0.04)",
                border: "1px solid rgba(0,212,170,0.15)",
                borderRadius: "12px",
                padding: "14px 20px",
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <CheckCircle size={14} color="#00D4AA" />
              <span
                style={{ fontSize: "13px", color: "#00D4AA", fontWeight: 600 }}
              >
                Todas as dependências operacionais
              </span>
            </div>
          )}

          <div className="dep-grid dep-fade-2">
            {myDeps.map((service) => {
              const isDown =
                service.current_indicator &&
                service.current_indicator !== "none";
              return (
                <div
                  key={service.id}
                  className="service-card"
                  style={{
                    background: "#0D1117",
                    border: `1px solid ${isDown ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.06)"}`,
                    borderRadius: "12px",
                    padding: "18px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      marginBottom: "10px",
                      gap: "10px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        minWidth: 0,
                      }}
                    >
                      <ServiceLogo
                        websiteUrl={service.website_url}
                        name={service.name}
                      />
                      <div style={{ minWidth: 0 }}>
                        <p
                          style={{
                            color: "#F0F6FC",
                            fontSize: "14px",
                            fontWeight: 700,
                            margin: "0 0 2px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {service.name}
                        </p>
                        <p
                          style={{
                            color: "#bbbbbbbb",
                            fontSize: "11px",
                            margin: 0,
                          }}
                        >
                          {CATEGORY_LABELS[service.category] ??
                            service.category}
                        </p>
                      </div>
                    </div>
                    <StatusIndicator indicator={service.current_indicator} />
                  </div>

                  {isDown && service.current_description && (
                    <p
                      style={{
                        fontSize: "11px",
                        color: "#F59E0B",
                        margin: "0 0 12px",
                        lineHeight: 1.5,
                        background: "rgba(245,158,11,0.06)",
                        border: "1px solid rgba(245,158,11,0.12)",
                        borderRadius: "6px",
                        padding: "8px 10px",
                      }}
                    >
                      {service.current_description}
                    </p>
                  )}

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginTop: "12px",
                      paddingTop: "12px",
                      borderTop: "1px solid rgba(255,255,255,0.04)",
                    }}
                  >
                    <a
                      href={service.status_page_url ?? service.website_url}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "11px",
                        color: "#bbbbbbbb",
                        textDecoration: "none",
                      }}
                    >
                      <ExternalLink size={10} /> Status page
                    </a>
                    <button
                      onClick={() => handleToggle(service)}
                      disabled={toggling === service.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        background: "none",
                        border: "1px solid transparent",
                        borderRadius: "6px",
                        padding: "4px 8px",
                        cursor: "pointer",
                        color: "#bbbbbbbb",
                        fontSize: "11px",
                        fontFamily: "'JetBrains Mono', monospace",
                        opacity: toggling === service.id ? 0.5 : 1,
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = "#EF4444";
                        e.currentTarget.style.borderColor =
                          "rgba(239,68,68,0.2)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = "#bbbbbbbb";
                        e.currentTarget.style.borderColor = "transparent";
                      }}
                    >
                      <X size={11} /> Remover
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
