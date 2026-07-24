import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { challengesApi } from '@/services/api/challenges';
import { cn } from '@/utils/cn';

const CHALLENGE_TYPES = ['DAILY', 'WEEKLY', 'CUSTOM'];
const CHALLENGE_STATUSES = ['ACTIVE', 'DRAFT', 'SCHEDULED', 'PAUSED', 'COMPLETED', 'CANCELLED'];

export const CreateChallengePage = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'DAILY',
    status: 'ACTIVE',
    rewardPool: '',
    startDate: '',
    endDate: '',
    bannerUrl: '',
    hashtagName: '',
    maxSubmissionsPerUser: '1',
    requiresApproval: false,
    rules: '',
    isSponsored: false,
    sponsorName: '',
    sponsorLogoUrl: '',
    sponsorUrl: '',
    termsAndConditions: '',
  });

  const update = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.title.trim()) { setError('Title is required'); return; }
    if (!form.endDate) { setError('End date is required'); return; }

    setSubmitting(true);
    try {
      const payload: any = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        type: form.type,
        status: form.status,
        rewardPool: form.rewardPool ? parseFloat(form.rewardPool) : 0,
        endDate: new Date(form.endDate).toISOString(),
        maxSubmissionsPerUser: form.maxSubmissionsPerUser ? parseInt(form.maxSubmissionsPerUser) : 1,
        requiresApproval: form.requiresApproval,
        isSponsored: form.isSponsored,
      };

      if (form.startDate) payload.startDate = new Date(form.startDate).toISOString();
      if (form.bannerUrl.trim()) payload.bannerUrl = form.bannerUrl.trim();
      if (form.hashtagName.trim()) payload.hashtagName = form.hashtagName.trim();
      if (form.rules.trim()) payload.rules = form.rules.trim();

      if (form.isSponsored) {
        if (form.sponsorName.trim()) payload.sponsorName = form.sponsorName.trim();
        if (form.sponsorLogoUrl.trim()) payload.sponsorLogoUrl = form.sponsorLogoUrl.trim();
        if (form.sponsorUrl.trim()) payload.sponsorUrl = form.sponsorUrl.trim();
        if (form.termsAndConditions.trim()) payload.termsAndConditions = form.termsAndConditions.trim();
      }

      await challengesApi.createChallenge(payload);
      navigate('/challenges');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create challenge');
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = 'w-full h-9 bg-muted border border-border rounded-lg px-3 text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-all';
  const textareaCls = 'w-full bg-muted border border-border rounded-lg px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-all resize-none';
  const labelCls = 'block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5';

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/challenges')}
          className="w-9 h-9 flex items-center justify-center border border-border rounded-lg hover:bg-muted text-muted-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-[26px] font-bold tracking-tight text-foreground">Create Challenge</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">Set up a new daily or weekly contest</p>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-[13px] font-medium px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-5 space-y-4">
        <div>
          <label className={labelCls}>Title *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            className={inputCls}
            placeholder="Dance Challenge"
          />
        </div>

        <div>
          <label className={labelCls}>Description</label>
          <textarea
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            rows={3}
            className={textareaCls}
            placeholder="Show off your best dance moves..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Type</label>
            <select value={form.type} onChange={(e) => update('type', e.target.value)} className={inputCls}>
              {CHALLENGE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Status</label>
            <select value={form.status} onChange={(e) => update('status', e.target.value)} className={inputCls}>
              {CHALLENGE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Start Date</label>
            <input type="datetime-local" value={form.startDate} onChange={(e) => update('startDate', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>End Date *</label>
            <input type="datetime-local" value={form.endDate} onChange={(e) => update('endDate', e.target.value)} className={inputCls} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Reward Pool (INR)</label>
            <input type="number" value={form.rewardPool} onChange={(e) => update('rewardPool', e.target.value)} className={inputCls} placeholder="5000" />
          </div>
          <div>
            <label className={labelCls}>Max Submissions per User</label>
            <input type="number" value={form.maxSubmissionsPerUser} onChange={(e) => update('maxSubmissionsPerUser', e.target.value)} className={inputCls} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Banner URL</label>
            <input type="text" value={form.bannerUrl} onChange={(e) => update('bannerUrl', e.target.value)} className={inputCls} placeholder="https://..." />
          </div>
          <div>
            <label className={labelCls}>Hashtag</label>
            <input type="text" value={form.hashtagName} onChange={(e) => update('hashtagName', e.target.value)} className={inputCls} placeholder="dancechallenge" />
          </div>
        </div>

        <div>
          <label className={labelCls}>Rules</label>
          <textarea value={form.rules} onChange={(e) => update('rules', e.target.value)} rows={2} className={textareaCls} />
        </div>

        <div className="space-y-2.5 pt-1">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={form.requiresApproval}
              onChange={(e) => update('requiresApproval', e.target.checked)}
              className="w-4 h-4 rounded border-border accent-primary"
            />
            <span className="text-[13px] text-foreground">Requires Admin Approval for Submissions</span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isSponsored}
              onChange={(e) => update('isSponsored', e.target.checked)}
              className="w-4 h-4 rounded border-border accent-primary"
            />
            <span className="text-[13px] text-foreground">Sponsored Challenge</span>
          </label>
        </div>

        {form.isSponsored && (
          <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
            <div>
              <label className={labelCls}>Sponsor Name</label>
              <input type="text" value={form.sponsorName} onChange={(e) => update('sponsorName', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Sponsor Logo URL</label>
              <input type="text" value={form.sponsorLogoUrl} onChange={(e) => update('sponsorLogoUrl', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Sponsor URL</label>
              <input type="text" value={form.sponsorUrl} onChange={(e) => update('sponsorUrl', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Terms and Conditions</label>
              <input type="text" value={form.termsAndConditions} onChange={(e) => update('termsAndConditions', e.target.value)} className={inputCls} />
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 pt-4 border-t border-border">
          <button
            type="submit"
            disabled={submitting}
            className="h-9 px-5 bg-primary text-primary-foreground text-[13px] font-semibold rounded-lg hover:bg-primary/90 active:scale-[0.97] disabled:opacity-50 transition-all"
          >
            {submitting ? 'Creating...' : 'Create Challenge'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/challenges')}
            className="h-9 px-5 text-[13px] font-semibold text-muted-foreground border border-border rounded-lg hover:bg-muted transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};