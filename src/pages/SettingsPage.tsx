import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { api } from "../services/api";
import { getMyPage, updatePage } from "../services/pages";
import { ExternalLink } from "lucide-react";

export function SettingsPage() {
  const { user } = useAuth();
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [pageTitle, setPageTitle] = useState("");
  const [pageDescription, setPageDescription] = useState("");
  const [pageSlug, setPageSlug] = useState("");
  const [originalSlug, setOriginalSlug] = useState("");
  const [savingPage, setSavingPage] = useState(false);
  const [pageSuccess, setPageSuccess] = useState(false);
  const [pageError, setPageError] = useState("");
  const [monitors, setMonitors] = useState<{ id: string; name: string }[]>([]);
  const [selectedMonitorIds, setSelectedMonitorIds] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([
      api.get("/settings/notifications"),
      getMyPage(),
      api.get("/monitors"),
    ])
      .then(([notifRes, page, monitorsRes]) => {
        if (notifRes.data.notifications) {
          setEmailEnabled(notifRes.data.notifications.email_enabled);
        }
        setPageTitle(page.title);
        setPageDescription(page.description || "");
        setPageSlug(page.slug);
        setOriginalSlug(page.slug);
        setMonitors(monitorsRes.data.monitors);
        setSelectedMonitorIds(page.monitor_ids || []);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setSuccess(false);
    try {
      await api.put("/settings/notifications", { email_enabled: emailEnabled });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  async function handleSavePage() {
    setSavingPage(true);
    setPageError("");
    setPageSuccess(false);
    try {
      await updatePage({
        title: pageTitle,
        description: pageDescription,
        slug: pageSlug !== originalSlug ? pageSlug : undefined,
        monitor_ids: selectedMonitorIds,
      });
      setOriginalSlug(pageSlug);
      setPageSuccess(true);
      setTimeout(() => setPageSuccess(false), 3000);
    } catch (err) {
      setPageError("Erro ao salvar");
      console.log("Erro ao salvar página: ", err);
    } finally {
      setSavingPage(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-[#00D4AA] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-white text-2xl font-bold">Configurações</h2>
        <p className="text-gray-500 text-sm mt-1">
          Gerencie sua conta e notificações
        </p>
      </div>

      <div className="bg-[#111827] rounded-xl border border-white/10 p-6 mb-6">
        <h3 className="text-white font-semibold mb-4">Conta</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Nome</label>
            <input
              type="text"
              value={user?.name}
              disabled
              className="w-full bg-[#0A0E1A] border border-white/10 rounded-lg px-4 py-2.5 text-gray-500 text-sm cursor-not-allowed"
            />
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Email</label>
            <input
              type="email"
              value={user?.email}
              disabled
              className="w-full bg-[#0A0E1A] border border-white/10 rounded-lg px-4 py-2.5 text-gray-500 text-sm cursor-not-allowed"
            />
          </div>
        </div>
        <div className="mt-4">
          <span
            className={`text-xs font-medium px-3 py-1 rounded-full ${
              user?.plan === "pro"
                ? "bg-[#00D4AA]/10 text-[#00D4AA]"
                : "bg-white/5 text-gray-400"
            }`}
          >
            Plano {user?.plan === "pro" ? "Pro" : "Free"}
          </span>
          {user?.plan === "free" && (
            <span className="text-gray-500 text-xs ml-3">
              Faça upgrade para o plano Pro para desbloquear mais recursos.
            </span>
          )}
        </div>
      </div>

      <div className="bg-[#111827] rounded-xl border border-white/10 p-6">
        <h3 className="text-white font-semibold mb-4">Notificações</h3>

        <div className="flex items-center justify-between py-3 border-b border-white/5">
          <div>
            <p className="text-white text-sm">Email</p>
            <p className="text-gray-500 text-xs mt-0.5">
              Receber alertas de downtime por email
            </p>
          </div>
          <button
            onClick={() => setEmailEnabled(!emailEnabled)}
            className={`shrink-0 w-12 h-6 rounded-full transition-all duration-200 relative ${
              emailEnabled ? "bg-[#00D4AA]" : "bg-white/10"
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200 shadow ${
                emailEnabled ? "left-7" : "left-1"
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between py-3">
          <div>
            <p className="text-white text-sm">WhatsApp</p>
            <p className="text-gray-500 text-xs mt-0.5">
              Disponível no plano Pro
            </p>
          </div>
          <button
            disabled
            className="shrink-0 w-12 h-6 rounded-full bg-white/5 relative cursor-not-allowed opacity-40"
          >
            <span className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow" />
          </button>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#00D4AA] hover:bg-[#00bfa0] text-black font-semibold px-5 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
          {success && (
            <span className="text-green-400 text-sm">✓ Salvo com sucesso</span>
          )}
        </div>
      </div>

      <div className="bg-[#111827] rounded-xl border border-white/10 p-6 mt-6">
        <h3 className="text-white font-semibold mb-1">Badge para README</h3>
        <p className="text-gray-500 text-sm mb-4">
          Cole no README do seu projeto no GitHub para mostrar o status em tempo
          real.
        </p>

        <div className="bg-[#0A0E1A] border border-white/10 rounded-lg p-4 mb-4">
          <p className="text-gray-500 text-xs mb-2">Preview</p>
          <img
            src={`${import.meta.env.VITE_API_URL}/badge/${originalSlug}`}
            alt="uptime badge"
          />
        </div>

        <div className="bg-[#0A0E1A] border border-white/10 rounded-lg p-4">
          <p className="text-gray-500 text-xs mb-2">Markdown</p>
          <code className="text-[#00D4AA] text-xs break-all">
            {`![uptime](${import.meta.env.VITE_API_URL}/badge/${originalSlug})`}
          </code>
        </div>
      </div>

      <div className="bg-[#111827] rounded-xl border border-white/10 p-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Status Page</h3>
          <a
            href={`/status/${pageSlug || originalSlug}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-[#00D4AA] text-xs hover:underline"
          >
            Ver página <ExternalLink size={12} />
          </a>
        </div>

        {pageError && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-3 mb-4">
            {pageError}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Título</label>
            <input
              type="text"
              value={pageTitle}
              onChange={(e) => setPageTitle(e.target.value)}
              className="w-full bg-[#0A0E1A] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00D4AA] transition-colors"
              placeholder="Minha Status Page"
            />
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-1 block">
              Slug
              {user?.plan !== "pro" && (
                <span className="ml-2 text-xs text-yellow-400">
                  — somente Pro
                </span>
              )}
            </label>
            <div className="flex items-center bg-[#0A0E1A] border border-white/10 rounded-lg px-4 py-2.5 gap-1">
              <span className="text-gray-600 text-sm">upstat.app/status/</span>
              <input
                type="text"
                value={pageSlug}
                onChange={(e) => setPageSlug(e.target.value)}
                disabled={user?.plan !== "pro"}
                className="flex-1 bg-transparent text-white text-sm focus:outline-none disabled:text-gray-500 disabled:cursor-not-allowed"
                placeholder="meu-slug"
              />
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="text-gray-400 text-sm mb-2 block">
            Monitores exibidos na page
          </label>
          <div className="space-y-2">
            {monitors.length === 0 ? (
              <p className="text-gray-600 text-sm">
                Nenhum monitor cadastrado ainda.
              </p>
            ) : (
              monitors.map((monitor) => (
                <label
                  key={monitor.id}
                  className="flex items-center gap-3 p-3 bg-[#0A0E1A] border border-white/10 rounded-lg cursor-pointer hover:border-[#00D4AA]/30 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedMonitorIds.includes(monitor.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedMonitorIds((prev) => [...prev, monitor.id]);
                      } else {
                        setSelectedMonitorIds((prev) =>
                          prev.filter((id) => id !== monitor.id),
                        );
                      }
                    }}
                    className="accent-[#00D4AA]"
                  />
                  <span className="text-white text-sm">{monitor.name}</span>
                </label>
              ))
            )}
          </div>
        </div>

        <div className="mb-4">
          <label className="text-gray-400 text-sm mb-1 block">Descrição</label>
          <input
            type="text"
            value={pageDescription}
            onChange={(e) => setPageDescription(e.target.value)}
            className="w-full bg-[#0A0E1A] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00D4AA] transition-colors"
            placeholder="Acompanhe o status dos nossos serviços em tempo real."
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSavePage}
            disabled={savingPage}
            className="bg-[#00D4AA] hover:bg-[#00bfa0] text-black font-semibold px-5 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            {savingPage ? "Salvando..." : "Salvar"}
          </button>
          {pageSuccess && (
            <span className="text-green-400 text-sm">✓ Salvo com sucesso</span>
          )}
        </div>
      </div>
    </div>
  );
}
