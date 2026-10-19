import React, { useEffect, useRef, useState } from 'react';
import {
  providerConfigService,
  CanonicalWorkspaceConfig,
  AVAILABLE_MODELS,
} from '../services/providerConfigService';
import { effectiveProviderService } from '../services/effectiveProviderService';
import { apiClient } from '../services/apiClient';
import { Page, Card } from '../ui/Page';
import { Icon } from '../shell/Icon';
import { announceConfigChange } from '../lib/useModelState';
import { PROVIDER_LABELS, providerLabel } from '../lib/providers';

type Role = 'architect' | 'skeptic' | 'verifier' | 'arbiter';

const PROVIDERS = [
  { id: 'gemini', icon: 'auto_awesome', placeholder: 'AIza…' },
  { id: 'anthropic', icon: 'psychology', placeholder: 'sk-ant-…' },
  { id: 'groq', icon: 'bolt', placeholder: 'gsk_…' },
  { id: 'sambanova', icon: 'memory', placeholder: 'Key' },
  { id: 'openrouter', icon: 'alt_route', placeholder: 'sk-or-v1-…' },
];

const SEARCH_KEYS = [
  { id: 'tavily', label: 'Tavily', placeholder: 'tvly-…' },
  { id: 'serper', label: 'Serper', placeholder: 'Key' },
];

const SEATS: Array<{ role: Role; label: string; seat: string; description: string }> = [
  { role: 'architect', label: 'Analyst', seat: 'Seat 1', description: 'Frames the question and drafts the first proposal.' },
  { role: 'skeptic', label: 'Critic', seat: 'Seat 2', description: 'Attacks assumptions and looks for counterexamples.' },
  { role: 'verifier', label: 'Verifier', seat: 'Seat 3 · Deep mode', description: 'Checks the claims against the retrieved sources.' },
  { role: 'arbiter', label: 'Synthesizer', seat: 'Final seat', description: 'Writes the answer-first brief from the debate.' },
];

const ALL_PROVIDERS = ['gemini', 'anthropic', 'groq', 'sambanova', 'openrouter', 'ollama', 'openai-compatible'];
const CUSTOM = '__custom__';

const ENGINES = [
  ['duckduckgo', 'DuckDuckGo', 'No key needed'],
  ['tavily', 'Tavily', 'Configured key in Search Keys below'],
  ['serper', 'Serper', 'Configured key in Search Keys below'],
  ['brave', 'Brave Search', 'Fast privacy-first index'],
  ['google', 'Google Custom Search', 'Google Programmable Search'],
  ['searxng', 'SearXNG', 'Open metasearch instance'],
] as const;

const METHODS = [
  ['adaptive', 'Adaptive', 'Let the planner choose the approach for each question.'],
  ['systematic', 'Systematic audit', 'Work through sources one by one, like a literature review.'],
  ['evidence-map', 'Evidence map', 'Map claims to evidence and surface contradictions.'],
  ['comparative', 'Comparative', 'Contrast the viewpoints of several models.'],
] as const;

export interface SettingsWorkspaceProps {
  initialTab?: 'models' | 'general';
}

export const SettingsWorkspace: React.FC<SettingsWorkspaceProps> = ({ initialTab = 'models' }) => {
  const [activeTab, setActiveTab] = useState<'models' | 'general'>(initialTab);
  const [config, setConfig] = useState<CanonicalWorkspaceConfig>(providerConfigService.getConfig());
  const [show, setShow] = useState<Record<string, boolean>>({});
  const [test, setTest] = useState<{ id: string; busy?: boolean; valid?: boolean; message?: string } | null>(null);
  const [saved, setSaved] = useState(false);
  const [ollamaUrl, setOllamaUrl] = useState(config.ollamaBaseUrl || 'http://localhost:11434');
  const [customOpen, setCustomOpen] = useState<Partial<Record<Role, boolean>>>({});
  const timer = useRef<number | undefined>(undefined);

  const active = effectiveProviderService.getActiveRoutableModel();
  const serverGemini = effectiveProviderService.isServerGeminiConfigured();

  useEffect(() => {
    setConfig(providerConfigService.getConfig());
    void effectiveProviderService.refreshServerHealth();
  }, []);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const commit = (next: CanonicalWorkspaceConfig) => {
    setConfig(next);
    providerConfigService.saveConfig(next);
    announceConfigChange();
    setSaved(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setSaved(false), 1800);
  };

  const change = (p: Partial<CanonicalWorkspaceConfig>) => {
    commit({ ...config, ...p });
  };

  const setKey = (id: string, v: string) => commit({ ...config, keys: { ...config.keys, [id]: v } });
  const setSeat = (role: Role, provider: any, model: string) =>
    commit({ ...config, roles: { ...config.roles, [role]: { provider, model } }, preset: 'custom' });

  const verify = async (id: string) => {
    const key = (config.keys as any)[id];
    if (!key && id !== 'ollama') {
      setTest({ id, valid: false, message: 'Enter a key first.' });
      return;
    }
    setTest({ id, busy: true });
    try {
      const r = await apiClient.verifyKey(id, key || '');
      setTest({
        id,
        valid: r.valid,
        message: r.message || (r.valid ? 'Key verified successfully.' : 'Key rejected or network error.'),
      });
    } catch (e: any) {
      setTest({ id, valid: false, message: e?.message || 'Verification failed.' });
    }
  };

  const Result = ({ id }: { id: string }) =>
    test?.id === id && !test.busy && test.message ? (
      <p role="status" className={`font-code-sm text-code-sm mt-space-xs ${test.valid ? 'text-tertiary' : 'text-error'}`}>
        {test.message}
      </p>
    ) : null;

  const keyField = (id: string, placeholder: string) => {
    const v = (config.keys as any)[id] || '';
    return (
      <div>
        <div className="flex items-center gap-space-xs bg-surface-container-lowest rounded-xl hairline focus-within:shadow-[inset_0_0_0_1px_rgba(76,214,251,0.5)] px-space-sm">
          <input
            type={show[id] ? 'text' : 'password'}
            value={v}
            onChange={(e) => setKey(id, e.target.value)}
            placeholder={placeholder}
            autoComplete="off"
            spellCheck={false}
            aria-label={`${id} API key`}
            className="flex-1 min-w-0 bg-transparent py-2.5 font-code-md text-code-md placeholder:text-outline-variant focus:outline-none"
          />
          <button
            type="button"
            aria-label={show[id] ? 'Hide key' : 'Show key'}
            onClick={() => setShow((s) => ({ ...s, [id]: !s[id] }))}
            className="p-1.5 rounded-lg text-outline hover:text-on-surface transition-colors"
          >
            <Icon name={show[id] ? 'visibility_off' : 'visibility'} className="text-[18px]" />
          </button>
        </div>
        <div className="flex items-center gap-space-xs mt-space-xs">
          <button
            type="button"
            onClick={() => void verify(id)}
            disabled={!v || test?.busy}
            className="px-space-sm min-h-[32px] rounded-lg bg-surface-container-high hover:bg-surface-container-highest font-label-md text-label-md disabled:opacity-40 transition-colors"
          >
            {test?.id === id && test.busy ? 'Testing…' : 'Test key'}
          </button>
          {v && (
            <button
              type="button"
              onClick={() => setKey(id, '')}
              className="px-space-sm min-h-[32px] rounded-lg text-on-surface-variant hover:text-error font-label-md text-label-md transition-colors"
            >
              Remove
            </button>
          )}
        </div>
        <Result id={id} />
      </div>
    );
  };

  const hb = config.heartbeatIntervalSec || 30;

  return (
    <div className="w-full max-w-5xl mx-auto px-gutter lg:px-space-lg py-space-lg lg:py-space-xl flex flex-col gap-space-lg lg:gap-space-xl">
      {/* Workspace Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
        <div>
          <div className="hidden lg:block font-code-sm text-code-sm uppercase tracking-wider text-outline">
            Workspace / Settings
          </div>
          <h1 className="font-headline-xl-mobile lg:font-headline-xl text-headline-xl-mobile lg:text-headline-xl tracking-tight mt-1">
            Settings &amp; AI Models
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1 max-w-xl">
            Configure multi-model council providers, BYOK credentials, council seats, web search, and research reasoning.
          </p>
        </div>

        <div className="flex items-center gap-space-sm self-start md:self-auto">
          <span className="flex items-center gap-space-sm px-space-md py-space-xs rounded-full bg-surface-container-high font-label-md text-label-md">
            <span className={`w-2 h-2 rounded-circle ${active || serverGemini ? 'bg-tertiary' : 'bg-outline'}`} />
            {active
              ? `${providerLabel(active.provider)} · ${active.model}`
              : serverGemini
              ? 'Server Gemini available'
              : 'No model assigned'}
          </span>
          <span
            className={`flex items-center gap-1 font-code-sm text-code-sm text-tertiary transition-opacity ${
              saved ? 'opacity-100' : 'opacity-0'
            }`}
            aria-live="polite"
          >
            <Icon name="check" className="text-[16px]" />
            Saved
          </span>
        </div>
      </div>

      {/* Segmented Tab Navigation for Settings */}
      <div className="flex items-center p-1 bg-surface-container rounded-2xl hairline max-w-md">
        <button
          type="button"
          onClick={() => setActiveTab('models')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-label-md text-label-md transition-all ${
            activeTab === 'models'
              ? 'bg-surface-container-high text-primary shadow-sm font-medium'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <Icon name="hub" className="text-[18px]" />
          <span>AI Models &amp; Keys</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-label-md text-label-md transition-all ${
            activeTab === 'general'
              ? 'bg-surface-container-high text-primary shadow-sm font-medium'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <Icon name="tune" className="text-[18px]" />
          <span>General &amp; Search</span>
        </button>
      </div>

      {/* ──────────────── TAB: MODELS & KEYS ──────────────── */}
      {activeTab === 'models' && (
        <div className="flex flex-col gap-space-xl">
          {/* Provider Connections */}
          <section aria-labelledby="prov-h">
            <div className="flex items-center justify-between mb-space-md">
              <h2 id="prov-h" className="font-headline-md text-headline-md">
                Model Provider Connections (BYOK)
              </h2>
              <span className="font-code-sm text-code-sm text-outline">Stored in this browser</span>
            </div>
            <div className="grid md:grid-cols-2 gap-space-md">
              {PROVIDERS.map((p) => {
                const has = Boolean((config.keys as any)[p.id]);
                return (
                  <div key={p.id} className="bg-surface-container rounded-3xl p-space-lg coat">
                    <div className="flex items-center justify-between mb-space-md">
                      <div className="flex items-center gap-space-sm">
                        <span className="w-9 h-9 rounded-xl bg-surface-container-high text-primary flex items-center justify-center">
                          <Icon name={p.icon} className="text-[20px]" />
                        </span>
                        <span className="font-headline-sm text-headline-sm">{PROVIDER_LABELS[p.id]}</span>
                      </div>
                      <span
                        className={`flex items-center gap-1.5 font-code-sm text-code-sm ${
                          has ? 'text-tertiary' : 'text-outline'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-circle ${has ? 'bg-tertiary' : 'bg-outline'}`} />
                        {has ? 'Key saved' : 'Not connected'}
                      </span>
                    </div>
                    {keyField(p.id, p.placeholder)}
                  </div>
                );
              })}

              {/* Local Ollama */}
              <div className="bg-surface-container rounded-3xl p-space-lg coat">
                <div className="flex items-center justify-between mb-space-md">
                  <div className="flex items-center gap-space-sm">
                    <span className="w-9 h-9 rounded-xl bg-surface-container-high text-primary flex items-center justify-center">
                      <Icon name="dns" className="text-[20px]" />
                    </span>
                    <span className="font-headline-sm text-headline-sm">Local Ollama</span>
                  </div>
                  <span className="font-code-sm text-code-sm text-outline">Runs on your machine</span>
                </div>
                <div className="flex gap-space-xs">
                  <input
                    value={ollamaUrl}
                    onChange={(e) => setOllamaUrl(e.target.value)}
                    aria-label="Ollama base URL"
                    placeholder="http://localhost:11434"
                    className="flex-1 min-w-0 bg-surface-container-lowest rounded-xl hairline px-space-md py-2.5 font-code-md text-code-md focus:outline-none focus:shadow-[inset_0_0_0_1px_rgba(76,214,251,0.5)]"
                  />
                </div>
                <div className="flex items-center gap-space-xs mt-space-xs">
                  <button
                    type="button"
                    onClick={() => commit({ ...config, ollamaBaseUrl: ollamaUrl.trim() })}
                    className="px-space-sm min-h-[32px] rounded-lg bg-surface-container-high hover:bg-surface-container-highest font-label-md text-label-md transition-colors"
                  >
                    Save URL
                  </button>
                  <button
                    type="button"
                    onClick={() => void verify('ollama')}
                    disabled={test?.busy}
                    className="px-space-sm min-h-[32px] rounded-lg bg-surface-container-high hover:bg-surface-container-highest font-label-md text-label-md disabled:opacity-40 transition-colors"
                  >
                    {test?.id === 'ollama' && test.busy ? 'Testing…' : 'Test connection'}
                  </button>
                </div>
                <Result id="ollama" />
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-sm">
                  Pick an Ollama model per seat below using “Custom model ID”. Ensure CORS allows origin access.
                </p>
              </div>
            </div>
          </section>

          {/* Council Seats */}
          <section aria-labelledby="seat-h">
            <div className="flex flex-wrap items-center justify-between gap-space-sm mb-space-md">
              <div>
                <h2 id="seat-h" className="font-headline-md text-headline-md">
                  Multi-Model Council Seats
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Each stage of a research inquiry calls the model assigned to its respective seat.
                </p>
              </div>
              <div className="flex items-center gap-space-xs" role="group" aria-label="Presets">
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider mr-1">Presets</span>
                {(['fast', 'balanced', 'deep'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      setConfig({ ...providerConfigService.applyPreset(p) });
                      announceConfigChange();
                    }}
                    aria-pressed={config.preset === p}
                    className={`px-space-md min-h-[36px] rounded-xl font-label-md text-label-md capitalize transition-colors ${
                      config.preset === p
                        ? 'bg-surface-container-high text-primary'
                        : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-space-md">
              {SEATS.map((s) => {
                const cur = config.roles[s.role];
                const inCatalog = Boolean(
                  cur?.provider && (AVAILABLE_MODELS[cur.provider] || []).some((m) => m.id === cur.model)
                );
                const isCustom = Boolean(cur?.model) && !inCatalog;
                const sel = customOpen[s.role] || isCustom ? CUSTOM : !cur?.model ? '' : `${cur.provider}::${cur.model}`;
                return (
                  <div key={s.role} className="bg-surface-container rounded-3xl p-space-lg coat">
                    <div className="flex items-start justify-between gap-space-sm">
                      <div>
                        <div className="font-code-sm text-code-sm text-outline">{s.seat}</div>
                        <div className="font-headline-sm text-headline-sm">{s.label}</div>
                      </div>
                      <span
                        className={`w-2 h-2 rounded-circle mt-2 ${cur?.model?.trim() ? 'bg-tertiary' : 'bg-outline'}`}
                      />
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 mb-space-md">{s.description}</p>
                    <select
                      aria-label={`${s.label} model`}
                      value={sel}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (!v) {
                          setCustomOpen((c) => ({ ...c, [s.role]: false }));
                          setSeat(s.role, '', '');
                        } else if (v === CUSTOM) {
                          setCustomOpen((c) => ({ ...c, [s.role]: true }));
                          if (inCatalog) setSeat(s.role, cur.provider, '');
                        } else {
                          setCustomOpen((c) => ({ ...c, [s.role]: false }));
                          const [p, ...m] = v.split('::');
                          setSeat(s.role, p, m.join('::'));
                        }
                      }}
                      className="w-full bg-surface-container-lowest rounded-xl hairline px-space-md min-h-[44px] font-body-sm text-body-sm focus:outline-none focus:shadow-[inset_0_0_0_1px_rgba(76,214,251,0.5)]"
                    >
                      <option value="">No model assigned</option>
                      {Object.entries(AVAILABLE_MODELS).map(([prov, models]) => (
                        <optgroup key={prov} label={providerLabel(prov)}>
                          {models.map((m) => (
                            <option key={m.id} value={`${prov}::${m.id}`}>
                              {m.name}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                      <option value={CUSTOM}>Custom model ID…</option>
                    </select>
                    {sel === CUSTOM && (
                      <div className="grid grid-cols-5 gap-space-xs mt-space-xs">
                        <select
                          aria-label="Provider"
                          value={cur?.provider || 'openrouter'}
                          onChange={(e) => setSeat(s.role, e.target.value, cur?.model || '')}
                          className="col-span-2 bg-surface-container-lowest rounded-xl hairline px-space-sm min-h-[44px] font-body-sm text-body-sm focus:outline-none"
                        >
                          {ALL_PROVIDERS.map((p) => (
                            <option key={p} value={p}>
                              {providerLabel(p)}
                            </option>
                          ))}
                        </select>
                        <input
                          aria-label="Model ID"
                          value={cur?.model || ''}
                          onChange={(e) => setSeat(s.role, cur?.provider || 'openrouter', e.target.value)}
                          placeholder="exact model id"
                          className="col-span-3 bg-surface-container-lowest rounded-xl hairline px-space-sm min-h-[44px] font-code-md text-code-md focus:outline-none focus:shadow-[inset_0_0_0_1px_rgba(76,214,251,0.5)]"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="font-body-sm text-body-sm text-outline mt-space-sm">
              Use “Custom model ID” to connect any new frontier checkpoint released by your provider.
            </p>
          </section>

          {/* Search Keys */}
          <section aria-labelledby="search-h" className="pb-space-xl">
            <div className="flex items-center justify-between mb-space-md">
              <h2 id="search-h" className="font-headline-md text-headline-md">
                Dedicated Search API Keys <span className="font-body-sm text-body-sm text-outline">(optional)</span>
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-space-md">
              {SEARCH_KEYS.map((k) => (
                <div key={k.id} className="bg-surface-container rounded-3xl p-space-lg coat">
                  <div className="font-headline-sm text-headline-sm mb-space-md">{k.label}</div>
                  {keyField(k.id, k.placeholder)}
                </div>
              ))}
            </div>
            <p className="font-body-sm text-body-sm text-outline mt-space-sm">
              DuckDuckGo requires no API key. Switch your default search engine in General Settings.
            </p>
          </section>
        </div>
      )}

      {/* ──────────────── TAB: GENERAL PREFERENCES & SEARCH ──────────────── */}
      {activeTab === 'general' && (
        <div className="flex flex-col gap-space-lg max-w-3xl">
          <Card>
            <h2 className="font-headline-md text-headline-md">Web search provider</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
              Used by research runs to retrieve primary sources before and during the multi-model debate.
            </p>
            <div className="grid sm:grid-cols-2 gap-space-sm" role="radiogroup" aria-label="Search engine">
              {ENGINES.map(([id, name, note]) => {
                const on = (config.searchEngine || 'duckduckgo') === id;
                return (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => change({ searchEngine: id as any })}
                    className={`text-left rounded-2xl p-space-md min-h-[64px] transition-colors ${
                      on
                        ? 'bg-surface-container-high ring-1 ring-primary/50'
                        : 'bg-surface-container-low hover:bg-surface-container-high'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-headline-sm text-headline-sm">{name}</span>
                      <span
                        className={`w-4 h-4 rounded-circle flex items-center justify-center ${
                          on ? 'bg-primary' : 'bg-surface-container-highest'
                        }`}
                      >
                        {on && <Icon name="check" className="text-[12px] text-on-primary" />}
                      </span>
                    </div>
                    <div className="font-code-sm text-code-sm text-outline mt-0.5">{note}</div>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card>
            <h2 className="font-headline-md text-headline-md">Default research method</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
              The default reasoning protocol applied on new runs. You can also change it directly on the Research screen.
            </p>
            <div className="flex flex-col gap-space-xs" role="radiogroup" aria-label="Research method">
              {METHODS.map(([id, name, desc]) => {
                const on = (config.researchMethod || 'adaptive') === id;
                return (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => change({ researchMethod: id as any })}
                    className={`flex items-start gap-space-md text-left rounded-2xl p-space-md min-h-[56px] transition-colors ${
                      on
                        ? 'bg-surface-container-high ring-1 ring-primary/50'
                        : 'bg-surface-container-low hover:bg-surface-container-high'
                    }`}
                  >
                    <span
                      className={`mt-1 w-4 h-4 rounded-circle shrink-0 flex items-center justify-center ${
                        on ? 'bg-primary' : 'bg-surface-container-highest'
                      }`}
                    >
                      {on && <span className="w-1.5 h-1.5 rounded-circle bg-on-primary" />}
                    </span>
                    <span>
                      <span className="font-headline-sm text-headline-sm block">{name}</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">{desc}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card>
            <div className="flex items-start justify-between gap-space-md">
              <div>
                <h2 className="font-headline-md text-headline-md">Resolve contradictions</h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                  Let the final seat synthesize and reconcile points where the models disagreed. Turn off to inspect raw disagreement.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={config.autoResolve ?? true}
                aria-label="Resolve contradictions"
                onClick={() => change({ autoResolve: !(config.autoResolve ?? true) })}
                className={`relative w-12 h-7 shrink-0 rounded-circle transition-colors ${
                  config.autoResolve ?? true ? 'bg-primary' : 'bg-surface-container-highest'
                }`}
              >
                <span
                  className={`absolute top-1 w-5 h-5 rounded-circle bg-surface transition-all ${
                    config.autoResolve ?? true ? 'left-6' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <h2 className="font-headline-md text-headline-md">Keep-alive interval</h2>
              <span className="font-code-md text-code-md text-primary">{hb}s</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
              Long-running research runs send heartbeats at this frequency so proxies and browser connections stay active.
            </p>
            <input
              type="range"
              min={10}
              max={60}
              step={5}
              value={hb}
              aria-label="Keep-alive interval in seconds"
              onChange={(e) => change({ heartbeatIntervalSec: parseInt(e.target.value, 10) })}
              className="w-full accent-[#4cd6fb] h-8"
            />
            <div className="flex justify-between font-code-sm text-code-sm text-outline">
              <span>10s</span>
              <span>60s</span>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
