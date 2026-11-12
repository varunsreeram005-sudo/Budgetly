import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowDownLeft,
  ArrowUpRight,
  BarChart3,
  Bell,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle,
  CreditCard,
  Download,
  Filter,
  Home,
  Menu,
  Moon,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  ShoppingBag,
  Sun,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet,
  X,
  Utensils,
  Bus,
  ShoppingCart,
  Receipt,
  HeartPulse,
  Film,
  BriefcaseBusiness,
  Coffee,
  Clock3,
  Sparkles,
  Trash2,
  ArrowLeftRight,
} from 'lucide-react';

type Task = {
  id: string;
  title: string;
  date: string;
  time: string;
  priority: 'Low' | 'Medium' | 'High';
  done: boolean;
  notes?: string;
};
type Expense = {
  id: string;
  amount: number;
  category: string;
  note: string;
  date: string;
  mode: string;
};
type Tab = 'Today' | 'Planner' | 'Expenses' | 'Insights';
const categories = [
  'Food',
  'Travel',
  'Groceries',
  'Bills',
  'Shopping',
  'Health',
  'Entertainment',
  'Other',
];
const categoryColors: Record<string, string> = {
  Food: '#F59E70',
  Travel: '#75A7E8',
  Groceries: '#6DBB9B',
  Bills: '#A69AE8',
  Shopping: '#E59BC2',
  Health: '#E88D9B',
  Entertainment: '#E8B95F',
  Other: '#9AA5B5',
};
const categoryIcons: Record<string, any> = {
  Food: Utensils,
  Travel: Bus,
  Groceries: ShoppingCart,
  Bills: Receipt,
  Shopping: ShoppingBag,
  Health: HeartPulse,
  Entertainment: Film,
  Other: BriefcaseBusiness,
};
const today = new Date().toISOString().slice(0, 10);
const money = (n: number) =>
  '₹' +
  n.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
const seedTasks: Task[] = [
  {
    id: 't1',
    title: 'Finish project report',
    date: today,
    time: '09:00',
    priority: 'High',
    done: false,
  },
  {
    id: 't2',
    title: 'Review class notes',
    date: today,
    time: '11:30',
    priority: 'Medium',
    done: false,
  },
  {
    id: 't3',
    title: 'Buy groceries',
    date: today,
    time: '17:00',
    priority: 'Low',
    done: false,
  },
];
function read<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}
function App() {
  const [tab, setTab] = useState<Tab>('Today');
  const [tasks, setTasks] = useState<Task[]>(() =>
    read('budgetly_tasks', seedTasks)
  );
  const [expenses, setExpenses] = useState<Expense[]>(() =>
    read<Expense[]>('budgetly_expenses', []).filter(e => !['e1', 'e2', 'e3'].includes(e.id))
  );
  const [budget, setBudget] = useState(() => read('budgetly_budget', 12000));
  const [yearBudget, setYearBudget] = useState(() => read('budgetly_year_budget', 144000));
  const [limitsConfigured, setLimitsConfigured] = useState(() => read('budgetly_limits_configured', false));
  const [draftMonthly, setDraftMonthly] = useState(() => String(read('budgetly_budget', 12000)));
  const [draftYearly, setDraftYearly] = useState(() => String(read('budgetly_year_budget', 144000)));
  const [dark, setDark] = useState(() => read('budgetly_dark', false));
  const [modal, setModal] = useState<'task' | 'expense' | null>(null);
  const [settings, setSettings] = useState(false);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [note, setNote] = useState('');
  const [mode, setMode] = useState('UPI');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskTime, setTaskTime] = useState('16:00');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [taskDate, setTaskDate] = useState(today);
  const [weekOffset, setWeekOffset] = useState(0);
  const [notice, setNotice] = useState('');
  const [month, setMonth] = useState('This month');
  useEffect(() => {
    localStorage.setItem('budgetly_tasks', JSON.stringify(tasks));
  }, [tasks]);
  useEffect(() => {
    localStorage.setItem('budgetly_expenses', JSON.stringify(expenses));
  }, [expenses]);
  useEffect(() => {
    localStorage.setItem('budgetly_budget', JSON.stringify(budget));
  }, [budget]);
  useEffect(() => {
    localStorage.setItem('budgetly_year_budget', JSON.stringify(yearBudget));
  }, [yearBudget]);
  useEffect(() => {
    localStorage.setItem('budgetly_dark', JSON.stringify(dark));
  }, [dark]);
  const todayTasks = tasks
    .filter(t => t.date === today)
    .sort((a, b) => a.time.localeCompare(b.time));
  const todayExpenses = expenses.filter(e => e.date === today);
  const now = new Date();
  const monthExpenses = expenses.filter(e => {
    const d = new Date(e.date + 'T00:00:00');
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });
  const yearExpenses = expenses.filter(e => new Date(e.date + 'T00:00:00').getFullYear() === now.getFullYear());
  const spent = todayExpenses.reduce((s, e) => s + e.amount, 0);
  const monthSpent = monthExpenses.reduce((s, e) => s + e.amount, 0);
  const yearSpent = yearExpenses.reduce((s, e) => s + e.amount, 0);
  const completed = todayTasks.filter(t => t.done).length;
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const pct = Math.min(100, Math.round((spent / (budget / daysInMonth)) * 100));
  const saveLimits = () => {
    const monthly = Number(draftMonthly);
    const yearly = Number(draftYearly);
    if (!Number.isFinite(monthly) || monthly <= 0 || !Number.isFinite(yearly) || yearly <= 0) {
      setNotice('Enter valid monthly and yearly limits');
      window.setTimeout(() => setNotice(''), 2400);      return;
    }
    setBudget(monthly);
    setYearBudget(yearly);
    setLimitsConfigured(true);
    localStorage.setItem('budgetly_limits_configured', JSON.stringify(true));
  };
  const notify = (s: string) => {
    setNotice(s);
    window.setTimeout(() => setNotice(''), 2200);
  };
  const addExpense = () => {
    const n = Number(amount);
    if (!n || n <= 0) {
      notify('Enter a valid amount');
      return;
    }
    setExpenses(v => [
      { id: crypto.randomUUID(), amount: n, category, note, date: today, mode },
      ...v,
    ]);
    setAmount('');
    setNote('');
    setModal(null);
    notify('Expense added');
  };
  const addTask = () => {
    if (!taskTitle.trim()) {
      notify('Add a task title');
      return;
    }
    setTasks(v => [
      ...v,
      {
        id: crypto.randomUUID(),
        title: taskTitle.trim(),
        date: taskDate,
        time: taskTime,
        priority,
        done: false,
      },
    ]);
    setTaskTitle('');
    setModal(null);
    notify('Task added');
  };
  const toggleTask = (id: string) =>
    setTasks(v => v.map(t => (t.id === id ? { ...t, done: !t.done } : t)));
  const removeTask = (id: string) => setTasks(v => v.filter(t => t.id !== id));
  const exportCsv = () => {
    const rows = [
      ['Date', 'Amount', 'Category', 'Note', 'Payment mode'],
      ...expenses.map(e => [e.date, e.amount, e.category, e.note, e.mode]),
    ];
    const csv = rows
      .map(r =>
        r.map(x => '"' + String(x).replaceAll('"', '""') + '"').join(',')
      )
      .join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'budgetly-expenses.csv';
    a.click();
    URL.revokeObjectURL(a.href);
    notify('CSV exported');
  };
  const weekDays = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay() + 1 + weekOffset * 7);
    return Array.from({ length: 7 }, (_, i) => {
      const x = new Date(d);
      x.setDate(d.getDate() + i);
      return x;
    });
  }, [weekOffset]);
  const visibleExpenses = expenses.filter(
    e =>
      (filter === 'All' || e.category === filter) &&
      (e.note + ' ' + e.category).toLowerCase().includes(query.toLowerCase())
  );
  const groupedTasks = (period: string) =>
    tasks
      .filter(
        t =>
          t.date === today &&
          (period === 'Morning'
            ? Number(t.time.slice(0, 2)) < 12
            : period === 'Afternoon'
              ? Number(t.time.slice(0, 2)) >= 12 &&
                Number(t.time.slice(0, 2)) < 17
              : Number(t.time.slice(0, 2)) >= 17)
      )
      .sort((a, b) => a.time.localeCompare(b.time));
  const navItems: { name: Tab; icon: any }[] = [
    { name: 'Today', icon: Home },
    { name: 'Planner', icon: CalendarDays },
    { name: 'Expenses', icon: Wallet },
    { name: 'Insights', icon: BarChart3 },
  ];
  if (!limitsConfigured) {
    return (
      <div className={dark ? 'app dark limit-setup-app' : 'app limit-setup-app'}>
        <section className='limit-setup'>
          <div className='brand setup-brand'><span className='brand-mark'><Activity size={21} /></span><span>budgetly</span></div>
          <span className='eyebrow'>A FRESH START</span>
          <h1>Set your spending limits</h1>
          <p>Choose a monthly and yearly target. You can change either limit anytime in Settings.</p>
          <label className='field-label' htmlFor='setup-monthly'>Monthly limit</label>
          <div className='limit-input'><span>₹</span><input id='setup-monthly' type='number' min='1' inputMode='decimal' value={draftMonthly} onChange={e => setDraftMonthly(e.target.value)} /></div>
          <label className='field-label' htmlFor='setup-yearly'>Yearly limit</label>
          <div className='limit-input'><span>₹</span><input id='setup-yearly' type='number' min='1' inputMode='decimal' value={draftYearly} onChange={e => setDraftYearly(e.target.value)} /></div>
          <div className='limit-hint'><Target size={17} /> These are planning limits, not restrictions. Budgetly will help you track progress.</div>
          <button className='primary-btn setup-submit' onClick={saveLimits}>Save limits and continue <ArrowUpRight size={17} /></button>
          <small className='setup-privacy'>Saved only on this device. No account required.</small>
        </section>
      </div>
    );
  }
  return (
    <div className={dark ? 'app dark' : 'app'}>
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">
            <Activity size={21} />
          </span>
          <span>budgetly</span>
        </div>
        <div className="side-label">WORKSPACE</div>
        {navItems.map(n => (
          <button
            key={n.name}
            className={'nav-link ' + (tab === n.name ? 'active' : '')}
            onClick={() => setTab(n.name)}
          >
            <n.icon size={19} />
            {n.name}
          </button>
        ))}
        <div className="side-bottom">
          <div className="budget-mini">
            <div className="mini-icon">
              <Target size={17} />
            </div>
            <span>Monthly budget</span>
            <b>{money(budget)}</b>
            <div className="mini-track">
              <i
                style={{
                  width: Math.min(100, (monthSpent / budget) * 100) + '%',
                }}
              />
            </div>
            <small>{money(monthSpent)} spent so far</small>
          </div>
          <button className="nav-link" onClick={() => setSettings(true)}>
            <Settings size={18} />
            Settings
          </button>
          <div className="profile">
            <div className="avatar">V</div>
            <div>
              <b>Varun</b>
              <small>Personal space</small>
            </div>
            <MoreHorizontal size={18} />
          </div>
        </div>
      </aside>
      <main className="main">
        <header className="topbar">
          <div className="mobile-brand">
            <span className="brand-mark">
              <Activity size={18} />
            </span>
            budgetly
          </div>
          <div className="breadcrumb">
            Workspace <ChevronRight size={14} />
            <b>{tab}</b>
          </div>
          <div className="top-actions">
            <span className="date-pill">
              <CalendarDays size={15} />
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              })}
            </span>
            <button
              className="icon-btn"
              onClick={() => setDark(!dark)}
              aria-label="Toggle theme"
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              className="icon-btn"
              onClick={() => setSettings(true)}
              aria-label="Settings"            >
              <Settings size={18} />
            </button>
            <div className="avatar small">V</div>
          </div>
        </header>
        <div className="content">
          {tab === 'Today' && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">
                    THURSDAY,{' '}
                    {new Date()
                      .toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                      })
                      .toUpperCase()}
                  </div>
                  <h1>
                    Good morning, Varun <span className="sun">✦</span>
                  </h1>
                  <p>Make today count. One step at a time.</p>
                </div>
                <button
                  className="primary-btn"
                  onClick={() => setModal('task')}
                >
                  <Plus size={17} /> Add task
                </button>
              </div>
              <div className="stats-grid">
                <div className="stat-card balance">
                  <div className="stat-top">
                    <span>Total spent today</span>
                    <span className="stat-icon">
                      <Wallet size={17} />
                    </span>
                  </div>
                  <strong>{money(spent)}</strong>
                  <div className="stat-foot">
                    <span>Daily budget {money(budget / daysInMonth)}</span>
                    <span className="positive">
                      <TrendingDown size={14} /> {pct}% used
                    </span>
                  </div>
                  <div className="balance-wave">
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-top">
                    <span>Tasks completed</span>
                    <span className="soft-icon green">
                      <CheckCircle2 size={18} />
                    </span>
                  </div>
                  <strong>
                    {completed}
                    <em> / {todayTasks.length}</em>
                  </strong>
                  <div className="progress-line">
                    <i
                      style={{
                        width:
                          (todayTasks.length
                            ? (completed / todayTasks.length) * 100
                            : 0) + '%',
                      }}
                    />
                  </div>
                  <div className="stat-foot">
                    <span>
                      {todayTasks.length
                        ? Math.round((completed / todayTasks.length) * 100)
                        : 0}
                      % completion rate
                    </span>
                    <span className="muted">Today</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-top">
                    <span>Yearly budget left</span>
                    <span className="soft-icon green"><CalendarDays size={18} /></span>
                  </div>
                  <strong>{money(Math.max(0, yearBudget - yearSpent))}</strong>
                  <div className="progress-line"><i style={{ width: Math.min(100, (yearSpent / yearBudget) * 100) + '%' }} /></div>
                  <div className="stat-foot"><span>{money(yearSpent)} spent</span><span className="muted">{Math.round((yearSpent / yearBudget) * 100)}% used</span></div>
                </div>
                <div className="stat-card">
                  <div className="stat-top">
                    <span>Monthly budget left</span>
                    <span className="soft-icon purple">
                      <Target size={18} />
                    </span>
                  </div>
                  <strong>{money(Math.max(0, budget - monthSpent))}</strong>
                  <div className="progress-line purple-line">
                    <i
                      style={{
                        width: Math.min(100, (monthSpent / budget) * 100) + '%',
                      }}
                    />
                  </div>
                  <div className="stat-foot">
                    <span>{money(monthSpent)} spent</span>
                    <span className="muted">
                      {Math.round((monthSpent / budget) * 100)}% used
                    </span>
                  </div>
                </div>
              </div>
              <div className="dashboard-grid">
                <section className="panel tasks-panel">
                  <div className="panel-head">
                    <div>
                      <h2>Today's plan</h2>
                      <p>Your priorities, all in one place</p>
                    </div>
                    <button
                      className="text-btn"
                      onClick={() => setTab('Planner')}
                    >
                      View planner <ArrowUpRight size={15} />
                    </button>
                  </div>
                  {todayTasks.length === 0 ? (
                    <div className="empty">
                      <CalendarDays />
                      <b>A clear calendar</b>
                      <span>Add a task to get started.</span>
                    </div>
                  ) : (
                    todayTasks.map(t => (
                      <TaskRow
                        key={t.id}
                        task={t}
                        onToggle={toggleTask}
                        onDelete={removeTask}
                      />
                    ))
                  )}
                  <button className="add-row" onClick={() => setModal('task')}>
                    <Plus size={17} /> Add another task
                  </button>
                </section>
                <section className="panel spending-panel">
                  <div className="panel-head">
                    <div>
                      <h2>Spending today</h2>
                      <p>A little awareness goes a long way</p>
                    </div>
                    <button
                      className="text-btn"
                      onClick={() => setTab('Expenses')}
                    >
                      See all <ArrowUpRight size={15} />
                    </button>
                  </div>
                  {todayExpenses.length === 0 ? (
                    <div className="empty">
                      <Wallet />
                      <b>No expenses yet</b>
                      <span>Your spending will show here.</span>
                    </div>
                  ) : (
                    categories
                      .filter(c => todayExpenses.some(e => e.category === c))
                      .map(c => {
                        const total = todayExpenses
                          .filter(e => e.category === c)
                          .reduce((s, e) => s + e.amount, 0);
                        const Icon = categoryIcons[c];
                        return (
                          <div className="spend-row" key={c}>
                            <span
                              className="category-icon"
                              style={{
                                background: categoryColors[c] + '22',
                                color: categoryColors[c],
                              }}
                            >
                              <Icon size={16} />
                            </span>
                            <div className="spend-info">
                              <b>{c}</b>
                              <div className="spend-bar">
                                <i
                                  style={{
                                    width:
                                      Math.max(8, (total / spent) * 100) + '%',
                                    background: categoryColors[c],                                  }}
                                />
                              </div>
                            </div>
                            <strong>{money(total)}</strong>
                          </div>
                        );
                      })
                  )}
                  <button
                    className="add-row"
                    onClick={() => setModal('expense')}
                  >
                    <Plus size={17} /> Add expense
                  </button>
                </section>
              </div>
              <section className="tip-card">
                <div className="tip-icon">
                  <Sparkles size={20} />
                </div>
                <div>
                  <b>A little progress adds up</b>
                  <p>
                    {completed === todayTasks.length && todayTasks.length > 0
                      ? 'You completed every task on your list. Brilliant work!'
                      : 'Keep your day balanced — plan a little, spend mindfully, and take breaks.'}
                  </p>
                </div>
                <div className="tip-decoration">✳</div>
              </section>
            </>
          )}
          {tab === 'Planner' && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">MAKE ROOM FOR WHAT MATTERS</div>
                  <h1>Your planner</h1>
                  <p>A thoughtful plan for a calmer day.</p>
                </div>
                <button
                  className="primary-btn"
                  onClick={() => setModal('task')}
                >
                  <Plus size={17} /> New task
                </button>
              </div>
              <section className="panel calendar-panel">
                <div className="panel-head">
                  <div>
                    <h2>
                      {weekDays[0].toLocaleDateString('en-IN', {
                        month: 'long',
                        year: 'numeric',
                      })}
                    </h2>
                    <p>Your week at a glance</p>
                  </div>
                  <div className="week-controls">
                    <button
                      className="icon-btn"
                      onClick={() => setWeekOffset(v => v - 1)}
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      className="today-btn"
                      onClick={() => setWeekOffset(0)}
                    >
                      Today
                    </button>
                    <button
                      className="icon-btn"
                      onClick={() => setWeekOffset(v => v + 1)}
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
                <div className="week-strip">
                  {weekDays.map(d => {
                    const iso = d.toISOString().slice(0, 10);
                    return (
                      <button
                        key={iso}
                        className={
                          'week-day ' + (iso === today ? 'selected' : '')
                        }
                        onClick={() => setTaskDate(iso)}
                      >
                        <small>
                          {d.toLocaleDateString('en-IN', { weekday: 'short' })}
                        </small>
                        <b>{d.getDate()}</b>
                        <i />
                      </button>
                    );
                  })}
                </div>
              </section>
              {['Morning', 'Afternoon', 'Evening'].map(period => (
                <section className="panel planner-period" key={period}>
                  <div className="period-title">
                    <h2>{period}</h2>
                    <span>{groupedTasks(period).length} tasks</span>
                  </div>
                  {groupedTasks(period).length ? (
                    groupedTasks(period).map(t => (
                      <TaskRow
                        key={t.id}
                        task={t}
                        onToggle={toggleTask}
                        onDelete={removeTask}
                      />
                    ))
                  ) : (
                    <div className="period-empty">
                      Nothing planned for {period.toLowerCase()}.
                    </div>
                  )}
                </section>
              ))}
            </>
          )}
          {tab === 'Expenses' && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">YOUR MONEY, MADE CLEAR</div>
                  <h1>Expenses</h1>
                  <p>Keep track of the little things and the big picture.</p>
                </div>
                <button
                  className="primary-btn"
                  onClick={() => setModal('expense')}
                >
                  <Plus size={17} /> Add expense
                </button>
              </div>
              <div className="expense-summary">
                <div className="panel summary-main">
                  <span className="muted">Total recorded spending</span>
                  <strong>{money(monthSpent)}</strong>
                  <div className="summary-note">
                    <span className="positive">
                      <TrendingUp size={14} /> This month
                    </span>
                    <span>Across {expenses.length} transactions</span>
                  </div>
                </div>
                <div className="panel summary-budget">
                  <div className="budget-top">
                    <span>Monthly budget</span>
                    <button
                      className="text-btn"
                      onClick={() => setSettings(true)}
                    >
                      Edit
                    </button>
                  </div>
                  <strong>{money(budget)}</strong>
                  <div className="progress-line">
                    <i
                      style={{
                        width: Math.min(100, (monthSpent / budget) * 100) + '%',
                      }}
                    />
                  </div>
                  <small>
                    {money(Math.max(0, budget - monthSpent))} remaining
                  </small>
                </div>
              </div>
              <section className="panel transactions">
                <div className="panel-head">
                  <div>
                    <h2>Transactions</h2>
                    <p>Your recent activity</p>
                  </div>
                  <button className="outline-btn" onClick={exportCsv}>
                    <Download size={15} /> Export CSV
                  </button>
                </div>
                <div className="filter-row">
                  <div className="search-box">
                    <Search size={16} />
                    <input
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      placeholder="Search transactions"
                    />
                  </div>
                  <select
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                  >
                    <option>All</option>
                    {categories.map(c => (
                      <option key={c}>{c}</option>                    ))}
                  </select>
                </div>
                {visibleExpenses.length ? (
                  visibleExpenses.map(e => {
                    const Icon = categoryIcons[e.category] || BriefcaseBusiness;
                    return (
                      <div className="transaction-row" key={e.id}>
                        <span
                          className="category-icon large"
                          style={{
                            background:
                              (categoryColors[e.category] || '#9AA5B5') + '22',
                            color: categoryColors[e.category] || '#9AA5B5',
                          }}
                        >
                          <Icon size={18} />
                        </span>
                        <div className="transaction-info">
                          <b>{e.note || e.category}</b>
                          <small>
                            {e.category} · {e.mode} ·{' '}
                            {e.date === today ? 'Today' : e.date}
                          </small>
                        </div>
                        <strong>{money(e.amount)}</strong>
                        <button
                          className="delete-btn"
                          aria-label="Delete expense"
                          onClick={() =>
                            setExpenses(v => v.filter(x => x.id !== e.id))
                          }
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="empty">
                    <Receipt />
                    <b>No matching transactions</b>
                    <span>Try a different search or add an expense.</span>
                  </div>
                )}
              </section>
            </>
          )}
          {tab === 'Insights' && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">A CLEARER VIEW OF YOUR HABITS</div>
                  <h1>Insights</h1>
                  <p>Small patterns can lead to smarter choices.</p>
                </div>
                <select
                  className="period-select"
                  value={month}
                  onChange={e => setMonth(e.target.value)}
                >
                  <option>This month</option>
                  <option>Last 30 days</option>
                </select>
              </div>
              <div className="insight-top">
                <div className="panel insight-total">
                  <span className="muted">Total spending this month</span>
                  <strong>{money(monthSpent)}</strong>
                  <small>{monthExpenses.length} transactions recorded</small>
                  {monthSpent === 0 ? (
                    <small className="muted">Your spending trend will appear after you add expenses.</small>
                  ) : null}
                </div>
                <div className="panel insight-total">
                  <span className="muted">Tasks completed</span>
                  <strong>
                    {tasks.filter(t => t.done).length}
                    <em> / {tasks.length}</em>
                  </strong>
                  <small>
                    {tasks.length
                      ? Math.round(
                          (tasks.filter(t => t.done).length / tasks.length) *
                            100
                        )
                      : 0}
                    % overall completion
                  </small>
                  <div className="insight-icon">
                    <CheckCircle2 size={34} />
                  </div>
                </div>
              </div>
              <div className="insight-grid">
                <section className="panel">
                  <div className="panel-head">
                    <div>
                      <h2>Spending by category</h2>
                      <p>Where your money goes</p>
                    </div>
                  </div>
                  <div className="donut-layout">
                    <div
                      className="donut"
                      style={{ background: donutGradient(monthExpenses) }}
                    >
                      <div>
                        <b>{money(monthSpent)}</b>
                        <small>Total</small>
                      </div>
                    </div>
                    <div className="legend">
                      {categories.map(c => {
                        const n = monthExpenses
                          .filter(e => e.category === c)
                          .reduce((s, e) => s + e.amount, 0);
                        if (!n) return null;
                        return (
                          <div key={c}>
                            <i style={{ background: categoryColors[c] }} />
                            <span>{c}</span>
                            <b>{Math.round((n / (monthSpent || 1)) * 100)}%</b>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </section>
                <section className="panel">
                  <div className="panel-head">
                    <div>
                      <h2>Budget overview</h2>
                      <p>Monthly spending progress</p>
                    </div>
                  </div>
                  <div className="budget-overview">
                    <div
                      className="budget-ring"
                      style={
                        {
                          '--progress':
                            Math.min(100, (monthSpent / budget) * 100) + '%',
                        } as React.CSSProperties
                      }
                    >
                      <div>
                        <b>{Math.round((monthSpent / budget) * 100)}%</b>
                        <small>used</small>
                      </div>
                    </div>
                    <div>
                      <b>{money(Math.max(0, budget - monthSpent))}</b>
                      <small>of {money(budget)} left</small>
                    </div>
                  </div>
                  <div className="budget-advice">
                    {monthSpent > budget
                      ? 'You have reached your monthly budget. Review your spending to plan ahead.'
                      : 'You are within your monthly budget. Keep it up!'}
                  </div>
                </section>
              </div>
            </>
          )}
        </div>
      </main>
      <nav className="mobile-nav">
        {navItems.map(n => (
          <button
            key={n.name}
            className={tab === n.name ? 'active' : ''}
            onClick={() => setTab(n.name)}
          >
            <n.icon size={19} />
            <small>{n.name}</small>
          </button>
        ))}
      </nav>
      <button
        className="fab"
        onClick={() => setModal('expense')}
        aria-label="Quick add"
      >
        <Plus size={24} />
      </button>
      {modal && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <span className="eyebrow">QUICK ADD</span>
                <h2>{modal === 'task' ? 'Add a task' : 'Add an expense'}</h2>
              </div>
              <button className="icon-btn" onClick={() => setModal(null)}>
                <X size={19} />
              </button>
            </div>
            {modal === 'expense' ? (
              <>                <label className="field-label">Amount</label>
                <div className="amount-field">
                  <span>₹</span>
                  <input
                    autoFocus
                    inputMode="decimal"
                    type="number"
                    min="0"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <label className="field-label">Category</label>
                <div className="category-picker">
                  {categories.map(c => {
                    const Icon = categoryIcons[c];
                    return (
                      <button
                        key={c}
                        className={category === c ? 'chosen' : ''}
                        onClick={() => setCategory(c)}
                      >
                        <Icon size={16} />
                        {c}
                      </button>
                    );
                  })}
                </div>
                <label className="field-label">Note (optional)</label>
                <input
                  className="full-input"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="What was it for?"
                />
                <label className="field-label">Payment method</label>
                <div className="mode-picker">
                  {['UPI', 'Cash', 'Card'].map(m => (
                    <button
                      key={m}
                      className={mode === m ? 'chosen' : ''}
                      onClick={() => setMode(m)}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                <button
                  className="primary-btn modal-submit"
                  onClick={addExpense}
                >
                  Save expense <ArrowUpRight size={16} />
                </button>
              </>
            ) : (
              <>
                <label className="field-label">Task name</label>
                <input
                  className="full-input"
                  autoFocus
                  value={taskTitle}
                  onChange={e => setTaskTitle(e.target.value)}
                  placeholder="What needs to get done?"
                />
                <div className="two-fields">
                  <div>
                    <label className="field-label">Date</label>
                    <input
                      className="full-input"
                      type="date"
                      value={taskDate}
                      onChange={e => setTaskDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="field-label">Time</label>
                    <input
                      className="full-input"
                      type="time"
                      value={taskTime}
                      onChange={e => setTaskTime(e.target.value)}
                    />
                  </div>
                </div>
                <label className="field-label">Priority</label>
                <div className="mode-picker">
                  {(['Low', 'Medium', 'High'] as const).map(p => (
                    <button
                      key={p}
                      className={priority === p ? 'chosen' : ''}
                      onClick={() => setPriority(p)}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <button className="primary-btn modal-submit" onClick={addTask}>
                  Create task <ArrowUpRight size={16} />
                </button>
              </>
            )}
          </div>
        </div>
      )}
      {settings && (
        <div className="modal-backdrop" onClick={() => setSettings(false)}>
          <div
            className="modal settings-modal"
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-head">
              <div>
                <span className="eyebrow">PREFERENCES</span>
                <h2>Settings</h2>
              </div>
              <button className="icon-btn" onClick={() => setSettings(false)}>
                <X size={19} />
              </button>
            </div>
            <div className="setting-row">
              <div>
                <b>Appearance</b>
                <small>Choose your preferred theme</small>
              </div>
              <button className="outline-btn" onClick={() => setDark(!dark)}>
                {dark ? <Sun size={15} /> : <Moon size={15} />}{' '}
                {dark ? 'Light mode' : 'Dark mode'}
              </button>
            </div>
            <div className="setting-row">
              <div>
                <b>Monthly budget</b>
                <small>Set a spending target in INR</small>
              </div>
              <div className="budget-edit">
                <span>₹</span>
                <input
                  type="number"
                  value={budget}
                  onChange={e => setBudget(Math.max(0, Number(e.target.value)))}
                />
              </div>
            </div>
            <div className="setting-row">
              <div>
                <b>Yearly budget</b>
                <small>Set your annual spending target in INR</small>
              </div>
              <div className="budget-edit">
                <span>₹</span>
                <input type="number" min="1" value={yearBudget} onChange={e => setYearBudget(Math.max(0, Number(e.target.value)))} />
              </div>
            </div>
            <div className="setting-row">
              <div>
                <b>Currency</b>
                <small>Indian Rupee (INR)</small>
              </div>
              <span className="currency-tag">₹ INR</span>
            </div>
            <div className="setting-row">
              <div>
                <b>Your data</b>
                <small>Export your expense history</small>
              </div>
              <button className="outline-btn" onClick={exportCsv}>
                <Download size={15} /> Export CSV
              </button>
            </div>
            <p className="privacy-note">
              <CheckCircle2 size={15} /> Your data is stored on this device. No
              account required.
            </p>
            <button
              className="primary-btn modal-submit"
              onClick={() => setSettings(false)}
            >
              Done
            </button>
          </div>
        </div>
      )}
      {notice && (
        <div className="toast">
          <Check size={16} />
          {notice}
        </div>
      )}
    </div>
  );
}
function TaskRow({
  task,
  onToggle,
  onDelete,
}: {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;}) {
  return (
    <div className={'task-row ' + (task.done ? 'is-done' : '')}>
      <button
        className="check-btn"
        onClick={() => onToggle(task.id)}
        aria-label={task.done ? 'Mark incomplete' : 'Complete task'}
      >
        {task.done ? <Check size={14} /> : <Circle size={19} />}
      </button>
      <div className="task-copy">
        <b>{task.title}</b>
        <small>
          <Clock3 size={12} />
          {task.time}{' '}
          <span className="priority-dot" data-priority={task.priority} />{' '}
          {task.priority} priority
        </small>
      </div>
      <button
        className="delete-btn"
        aria-label="Delete task"
        onClick={() => onDelete(task.id)}
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}
function donutGradient(items: Expense[]) {
  const totals = categories.map(c =>
    items.filter(e => e.category === c).reduce((s, e) => s + e.amount, 0)
  );
  const sum = totals.reduce((a, b) => a + b, 0);
  if (!sum) return 'conic-gradient(#e9edf3 0% 100%)';
  let start = 0;
  const parts = totals
    .map((n, i) => {
      const end = start + (n / sum) * 100;
      const s = start;
      start = end;
      return categoryColors[categories[i]] + ' ' + s + '% ' + end + '%';
    })
    .filter((_, i) => totals[i] > 0);
  return 'conic-gradient(' + parts.join(',') + ')';
}
export default App;
