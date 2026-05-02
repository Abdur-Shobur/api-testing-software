'use client';

import { cn } from '@/lib/utils';
import {
	CheckCircle2,
	ChevronRight,
	Circle,
	Clock,
	Flame,
	Layers,
	MoreHorizontal,
	Pencil,
	Play,
	Plus,
	Terminal,
	Trash2,
	XCircle,
	Zap
} from 'lucide-react';
import { useState } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
type Status = 'pass' | 'fail' | 'pending';

interface TestCase {
  id: string;
  name: string;
  method: Method;
  url: string;
  expectedStatus: number;
  bodyMode: 'contains' | 'exact' | 'none';
  bodyContent: string;
  lastResult?: RunResult;
}

interface RunResult {
  status: Status;
  durationMs: number;
  httpStatus: number;
  responseBody: string;
  assertions: Assertion[];
}

interface Assertion {
  name: string;
  description: string;
  passed: boolean;
}

interface Collection {
  id: string;
  name: string;
  tests: TestCase[];
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_COLLECTIONS: Collection[] = [
  {
    id: 'col-1',
    name: 'Test',
    tests: [],
  },
  {
    id: 'col-2',
    name: 'ABC',
    tests: [
      {
        id: 'tc-1',
        name: 'Get collections',
        method: 'GET',
        url: 'http://localhost:4000/collections',
        expectedStatus: 200,
        bodyMode: 'contains',
        bodyContent: '{}',
        lastResult: {
          status: 'pass',
          durationMs: 8,
          httpStatus: 200,
          responseBody: JSON.stringify(
            {
              data: [
                { id: '65d7db4d', name: 'test', testCases: [], createdAt: '2026-05-02T01:30:49.721Z' },
                { id: '0546a9ec', name: 'NEw', testCases: [], createdAt: '2026-05-02T01:31:10.854Z' },
                {
                  id: '4777adaa', name: 'ABC',
                  testCases: [
                    { id: '36366336', name: 'Get collections' },
                    { id: 'd9ee71c6', name: 'Create collection' },
                  ],
                  createdAt: '2026-05-02T01:31:21.607Z',
                },
              ],
              total: 3,
            },
            null,
            2
          ),
          assertions: [
            { name: 'status', description: 'Status 200 matches expected 200', passed: true },
            { name: 'body', description: 'Response body contains {}', passed: true },
          ],
        },
      },
      {
        id: 'tc-2',
        name: 'Create collection',
        method: 'POST',
        url: 'http://localhost:4000/collections',
        expectedStatus: 201,
        bodyMode: 'contains',
        bodyContent: '{ "id": "" }',
        lastResult: {
          status: 'fail',
          durationMs: 14,
          httpStatus: 400,
          responseBody: JSON.stringify({ error: 'name is required' }, null, 2),
          assertions: [
            { name: 'status', description: 'Status 400 does not match expected 201', passed: false },
          ],
        },
      },
      {
        id: 'tc-3',
        name: 'Delete collection',
        method: 'DELETE',
        url: 'http://localhost:4000/collections/:id',
        expectedStatus: 204,
        bodyMode: 'none',
        bodyContent: '',
      },
    ],
  },
  {
    id: 'col-3',
    name: 'Auth',
    tests: [
      {
        id: 'tc-4',
        name: 'Login',
        method: 'POST',
        url: 'http://localhost:4000/auth/login',
        expectedStatus: 200,
        bodyMode: 'contains',
        bodyContent: '{ "token": "" }',
      },
    ],
  },
];

// ─── Constants ────────────────────────────────────────────────────────────────

const METHOD_STYLES: Record<Method, string> = {
  GET:    'text-sky-400 bg-sky-400/10 ring-sky-400/20',
  POST:   'text-emerald-400 bg-emerald-400/10 ring-emerald-400/20',
  PUT:    'text-amber-400 bg-amber-400/10 ring-amber-400/20',
  DELETE: 'text-rose-400 bg-rose-400/10 ring-rose-400/20',
  PATCH:  'text-violet-400 bg-violet-400/10 ring-violet-400/20',
};

const STATUS_CONFIG = {
  pass:    { label: 'Pass',    icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10 text-emerald-400 ring-emerald-400/20' },
  fail:    { label: 'Fail',    icon: XCircle,      color: 'text-rose-400',    bg: 'bg-rose-400/10 text-rose-400 ring-rose-400/20' },
  pending: { label: 'Pending', icon: Circle,       color: 'text-zinc-500',    bg: 'bg-zinc-800 text-zinc-500 ring-zinc-700' },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function MethodBadge({ method }: { method: Method }) {
  return (
    <span className={cn(
      'inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider ring-1 font-mono',
      METHOD_STYLES[method]
    )}>
      {method}
    </span>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ring-1',
      cfg.bg
    )}>
      {status === 'pass' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />}
      {status === 'fail' && <span className="w-1.5 h-1.5 rounded-full bg-rose-400 inline-block" />}
      {status === 'pending' && <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 inline-block" />}
      {cfg.label}
    </span>
  );
}

function IconBtn({
  children, onClick, variant = 'default', title,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'danger';
  title?: string;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={cn(
        'w-7 h-7 flex items-center justify-center rounded-md transition-all duration-150',
        'ring-1 ring-transparent',
        variant === 'default'
          ? 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-700/60 hover:ring-zinc-600'
          : 'text-zinc-500 hover:text-rose-400 hover:bg-rose-400/10 hover:ring-rose-400/20',
      )}
    >
      {children}
    </button>
  );
}

function Btn({
  children, onClick, variant = 'default', size = 'md',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'primary';
  size?: 'sm' | 'md';
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-md transition-all duration-150 active:scale-95',
        size === 'sm' ? 'text-xs px-2.5 h-7' : 'text-xs px-3 h-8',
        variant === 'default'
          ? 'bg-zinc-800 text-zinc-300 ring-1 ring-zinc-700 hover:bg-zinc-700 hover:text-zinc-100 hover:ring-zinc-600'
          : 'bg-zinc-100 text-zinc-900 hover:bg-white',
      )}
    >
      {children}
    </button>
  );
}

// ─── Panels ───────────────────────────────────────────────────────────────────

function Sidebar({
  collections,
  selectedId,
  onSelect,
  onDelete,
  onCreate,
}: {
  collections: Collection[];
  selectedId: string;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
}) {
  return (
    <aside className="flex flex-col border-r border-zinc-800 bg-zinc-900/50 w-56 shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-orange-500/20 flex items-center justify-center">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
          </div>
          <span className="text-[13px] font-semibold text-zinc-100 tracking-tight">API Test</span>
        </div>
        <IconBtn onClick={onCreate} title="New collection">
          <Plus className="w-3.5 h-3.5" />
        </IconBtn>
      </div>

      {/* Label */}
      <div className="px-4 pt-4 pb-1.5">
        <span className="text-[10px] font-semibold tracking-widest text-zinc-600 uppercase">Collections</span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2 pb-3 space-y-0.5">
        {collections.map((col) => (
          <button
            key={col.id}
            onClick={() => onSelect(col.id)}
            className={cn(
              'w-full flex items-center justify-between group px-3 py-2 rounded-lg text-left transition-all duration-150',
              selectedId === col.id
                ? 'bg-zinc-800 text-zinc-100'
                : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200',
            )}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Layers className="w-3.5 h-3.5 shrink-0 opacity-60" />
              <div className="min-w-0">
                <div className="text-[13px] font-medium truncate">{col.name}</div>
                <div className="text-[11px] text-zinc-600 mt-0.5">{col.tests.length} test{col.tests.length !== 1 ? 's' : ''}</div>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {selectedId === col.id && <ChevronRight className="w-3 h-3 opacity-40" />}
              <span
                onClick={(e) => { e.stopPropagation(); onDelete(col.id); }}
                className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded hover:text-rose-400 transition-all"
              >
                <Trash2 className="w-3 h-3" />
              </span>
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}

function TestsPanel({
  collection,
  selectedTestId,
  onSelect,
  onDelete,
  onCreate,
  onRunAll,
  onRun,
}: {
  collection: Collection | null;
  selectedTestId: string;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
  onRunAll: () => void;
  onRun: (id: string) => void;
}) {
  if (!collection) {
    return (
      <div className="flex-1 flex items-center justify-center text-zinc-600 text-sm border-r border-zinc-800">
        Select a collection
      </div>
    );
  }

  return (
    <div className="flex flex-col border-r border-zinc-800 w-72 shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <div>
          <span className="text-[13px] font-semibold text-zinc-100">{collection.name}</span>
        </div>
        <div className="flex gap-1.5">
          <Btn size="sm" onClick={onCreate}>
            <Plus className="w-3 h-3" />
            New
          </Btn>
          <Btn size="sm" variant="primary" onClick={onRunAll}>
            <Play className="w-3 h-3" />
            Run all
          </Btn>
        </div>
      </div>

      {/* Test list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {collection.tests.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 text-zinc-600 text-[13px] gap-2">
            <Terminal className="w-5 h-5" />
            No tests yet
          </div>
        )}
        {collection.tests.map((test) => (
          <div
            key={test.id}
            onClick={() => onSelect(test.id)}
            className={cn(
              'group rounded-lg px-3 py-2.5 cursor-pointer transition-all duration-150 border',
              selectedTestId === test.id
                ? 'bg-zinc-800 border-zinc-700'
                : 'bg-transparent border-transparent hover:bg-zinc-800/50 hover:border-zinc-800',
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <MethodBadge method={test.method} />
                <span className="text-[13px] font-medium text-zinc-200 truncate">{test.name}</span>
              </div>
              {test.lastResult && <StatusBadge status={test.lastResult.status} />}
            </div>
            <div className="text-[11px] text-zinc-600 mt-1.5 truncate font-mono">{test.url}</div>

            {/* Actions */}
            <div className={cn(
              'flex gap-1 mt-2 pt-2 border-t border-zinc-700/50 transition-all duration-150',
              selectedTestId === test.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
            )}>
              <IconBtn title="Run"  >
                <Play className="w-3.5 h-3.5" />
              </IconBtn>
              <IconBtn title="Edit">
                <Pencil className="w-3.5 h-3.5" />
              </IconBtn>
              <IconBtn title="More">
                <MoreHorizontal className="w-3.5 h-3.5" />
              </IconBtn>
              <div className="flex-1" />
              <IconBtn variant="danger" title="Delete"  >
                <Trash2 className="w-3.5 h-3.5" />
              </IconBtn>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

type DetailTab = 'body' | 'headers' | 'assertions';

function DetailPanel({ test }: { test: TestCase | null }) {
  const [tab, setTab] = useState<DetailTab>('body');

  if (!test) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 gap-3">
        <Zap className="w-8 h-8 opacity-30" />
        <span className="text-sm">Select a test to view details</span>
      </div>
    );
  }

  const result = test.lastResult;

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <MethodBadge method={test.method} />
          <span className="text-[14px] font-semibold text-zinc-100">{test.name}</span>
        </div>
        <div className="flex gap-1.5">
          <Btn size="sm">
            <Pencil className="w-3 h-3" />
            Edit
          </Btn>
          <Btn size="sm" variant="primary">
            <Play className="w-3 h-3" />
            Run test
          </Btn>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {/* Request */}
        <section>
          <SectionLabel>Request</SectionLabel>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 flex items-center gap-3">
            <MethodBadge method={test.method} />
            <span className="font-mono text-[12px] text-zinc-400 truncate">{test.url}</span>
          </div>
        </section>

        {/* Expected */}
        <section>
          <SectionLabel>Expected response</SectionLabel>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 flex items-center gap-3 flex-wrap">
            <Chip>Status {test.expectedStatus}</Chip>
            {test.bodyMode !== 'none' && (
              <>
                <span className="text-zinc-600 text-[11px]">body {test.bodyMode}</span>
                <Chip mono>{test.bodyContent}</Chip>
              </>
            )}
          </div>
        </section>

        {/* Result */}
        <section>
          <SectionLabel>Last run result</SectionLabel>
          {!result ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-6 flex items-center justify-center text-zinc-600 text-[13px] gap-2">
              <Play className="w-4 h-4" />
              Not yet run — press Run test to execute
            </div>
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
              {/* Result meta */}
              <div className="flex items-center gap-4 px-4 py-3 border-b border-zinc-800">
                <StatusBadge status={result.status} />
                <div className="flex items-center gap-1.5 text-[12px] text-zinc-500">
                  <Clock className="w-3 h-3" />
                  <span className="text-zinc-300 font-medium">{result.durationMs}ms</span>
                </div>
                <div className="w-px h-3 bg-zinc-700" />
                <span className={cn(
                  'text-[12px] font-mono font-semibold',
                  result.httpStatus < 300 ? 'text-emerald-400' : result.httpStatus < 400 ? 'text-amber-400' : 'text-rose-400',
                )}>
                  HTTP {result.httpStatus}
                </span>
                <div className="w-px h-3 bg-zinc-700" />
                <span className="text-[12px] text-zinc-500">{result.assertions.length} assertion{result.assertions.length !== 1 ? 's' : ''}</span>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-zinc-800">
                {(['body', 'headers', 'assertions'] as DetailTab[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={cn(
                      'px-4 py-2 text-[12px] font-medium capitalize transition-colors duration-150 border-b-2 -mb-px',
                      tab === t
                        ? 'text-zinc-100 border-orange-400'
                        : 'text-zinc-500 border-transparent hover:text-zinc-300',
                    )}
                  >
                    {t}
                    {t === 'assertions' && (
                      <span className={cn(
                        'ml-1.5 px-1.5 py-0.5 rounded-full text-[10px]',
                        result.assertions.every(a => a.passed) ? 'bg-emerald-400/10 text-emerald-400' : 'bg-rose-400/10 text-rose-400',
                      )}>
                        {result.assertions.filter(a => a.passed).length}/{result.assertions.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="p-4">
                {tab === 'body' && (
                  <pre className="font-mono text-[11px] text-zinc-400 leading-relaxed overflow-x-auto whitespace-pre-wrap break-all">
                    {result.responseBody}
                  </pre>
                )}
                {tab === 'headers' && (
                  <div className="space-y-1.5">
                    {[
                      ['Content-Type', 'application/json; charset=utf-8'],
                      ['X-Response-Time', `${result.durationMs}ms`],
                      ['Cache-Control', 'no-cache'],
                    ].map(([k, v]) => (
                      <div key={k} className="flex gap-3 font-mono text-[11px]">
                        <span className="text-zinc-500 shrink-0">{k}:</span>
                        <span className="text-zinc-300">{v}</span>
                      </div>
                    ))}
                  </div>
                )}
                {tab === 'assertions' && (
                  <div className="space-y-2">
                    {result.assertions.map((a, i) => (
                      <div key={i} className={cn(
                        'flex items-start gap-3 px-3 py-2.5 rounded-lg border',
                        a.passed ? 'border-emerald-400/20 bg-emerald-400/5' : 'border-rose-400/20 bg-rose-400/5',
                      )}>
                        {a.passed
                          ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          : <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        }
                        <div>
                          <div className="text-[12px] font-semibold text-zinc-200 capitalize">{a.name}</div>
                          <div className="text-[11px] text-zinc-500 mt-0.5">{a.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-semibold tracking-widest text-zinc-600 uppercase mb-2">{children}</div>
  );
}

function Chip({ children, mono }: { children: React.ReactNode; mono?: boolean }) {
  return (
    <span className={cn(
      'px-2.5 py-1 rounded-md bg-zinc-800 text-zinc-300 text-[12px] ring-1 ring-zinc-700',
      mono && 'font-mono',
    )}>
      {children}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const [collections, setCollections] = useState<Collection[]>(MOCK_COLLECTIONS);
  const [selectedColId, setSelectedColId] = useState(MOCK_COLLECTIONS[1].id);
  const [selectedTestId, setSelectedTestId] = useState(MOCK_COLLECTIONS[1].tests[0].id);

  const selectedCollection = collections.find(c => c.id === selectedColId) ?? null;
  const selectedTest = selectedCollection?.tests.find(t => t.id === selectedTestId) ?? null;

  const handleDeleteCollection = (id: string) => {
    setCollections(prev => prev.filter(c => c.id !== id));
    if (selectedColId === id) setSelectedColId(collections[0]?.id ?? '');
  };

  const handleCreateCollection = () => {
    const name = `Collection ${collections.length + 1}`;
    const newCol: Collection = { id: `col-${Date.now()}`, name, tests: [] };
    setCollections(prev => [...prev, newCol]);
    setSelectedColId(newCol.id);
  };

  const handleDeleteTest = (id: string) => {
    setCollections(prev => prev.map(c =>
      c.id === selectedColId ? { ...c, tests: c.tests.filter(t => t.id !== id) } : c
    ));
    if (selectedTestId === id) setSelectedTestId('');
  };

  const handleCreateTest = () => {
    const newTest: TestCase = {
      id: `tc-${Date.now()}`,
      name: 'New test',
      method: 'GET',
      url: 'http://localhost:4000/',
      expectedStatus: 200,
      bodyMode: 'none',
      bodyContent: '',
    };
    setCollections(prev => prev.map(c =>
      c.id === selectedColId ? { ...c, tests: [...c.tests, newTest] } : c
    ));
    setSelectedTestId(newTest.id);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-3 font-sans">
      <div className="h-[calc(100vh-24px)] flex flex-col rounded-xl border border-zinc-800 overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-zinc-700" />
              <span className="w-3 h-3 rounded-full bg-zinc-700" />
              <span className="w-3 h-3 rounded-full bg-zinc-700" />
            </div>
            <div className="w-px h-4 bg-zinc-800" />
            <div className="flex items-center gap-1.5 text-zinc-400">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-[12px] font-medium tracking-wide">API Testing</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-zinc-600">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
            Connected to localhost:4000
          </div>
        </div>

        {/* Main panels */}
        <div className="flex flex-1 min-h-0">
          <Sidebar
            collections={collections}
            selectedId={selectedColId}
            onSelect={(id) => { setSelectedColId(id); setSelectedTestId(''); }}
            onDelete={handleDeleteCollection}
            onCreate={handleCreateCollection}
          />
          <TestsPanel
            collection={selectedCollection}
            selectedTestId={selectedTestId}
            onSelect={setSelectedTestId}
            onDelete={handleDeleteTest}
            onCreate={handleCreateTest}
            onRunAll={() => {}}
            onRun={() => {}}
          />
          <DetailPanel test={selectedTest} />
        </div>
      </div>
    </div>
  );
}