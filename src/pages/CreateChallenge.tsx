import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { challengesApi } from '@/services/api/challenges';

const CHALLENGE_TYPES = ['DAILY', 'WEEKLY', 'CUSTOM'];
const CHALLENGE_STATUSES = ['ACTIVE', 'DRAFT', 'SCHEDULED', 'PAUSED', 'COMPLETED', 'CANCELLED'];

const labelCls = 'block text-xs font-mono uppercase text-muted-foreground mb-1.5';
const inputCls = 'w-full border border-border rounded-sm px-3 py-2 text-sm text-foreground bg-background focus:outline-none focus:border-primary';

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

  const update = (key: string, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!form.endDate) {
      setError('End date is required');
      return;
    }

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

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/challenges')}
          className="w-9 h-9 flex items-center justify-center border border-border rounded-sm hover:bg-muted text-muted-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground uppercase">Create Challenge</h1>
          <p className="text-sm text-muted-foreground font-mono">Set up a new daily/weekly contest</p>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm font-mono px-4 py-3 rounded-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-sm p-6 space-y-5 shadow-sm">
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
            className={inputCls}
            placeholder="Show off your best dance moves..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Type</label>
            <select
              value={form.type}
              onChange={(e) => update('type', e.target.value)}
              className={inputCls}
            >
              {CHALLENGE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Status</label>
            <select
              value={form.status}
              onChange={(e) => update('status', e.target.value)}
              className={inputCls}
            >
              {CHALLENGE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Start Date</label>
            <input
              type="datetime-local"
              value={form.startDate}
              onChange={(e) => update('startDate', e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>End Date *</label>
            <input
              type="datetime-local"
              value={form.endDate}
              onChange={(e) => update('endDate', e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Reward Pool (₹)</label>
            <input
              type="number"
              value={form.rewardPool}
              onChange={(e) => update('rewardPool', e.target.value)}
              className={inputCls}
              placeholder="5000"
            />
          </div>
          <div>
            <label className={labelCls}>Max Submissions / User</label>
            <input
              type="number"
              value={form.maxSubmissionsPerUser}
              onChange={(e) => update('maxSubmissionsPerUser', e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Banner URL</label>
            <input
              type="text"
              value={form.bannerUrl}
              onChange={(e) => update('bannerUrl', e.target.value)}
              className={inputCls}
              placeholder="https://..."
            />
          </div>
          <div>
            <label className={labelCls}>Hashtag</label>
            <input
              type="text"
              value={form.hashtagName}
              onChange={(e) => update('hashtagName', e.target.value)}
              className={inputCls}
              placeholder="dancechallenge"
            />
          </div>
        </div>

        <div>
          <label className={labelCls}>Rules</label>
          <textarea
            value={form.rules}
            onChange={(e) => update('rules', e.target.value)}
            rows={2}
            className={inputCls}
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={form.requiresApproval}
            onChange={(e) => update('requiresApproval', e.target.checked)}
          />
          Requires Admin Approval for Submissions
        </label>

        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={form.isSponsored}
            onChange={(e) => update('isSponsored', e.target.checked)}
          />
          Sponsored Challenge
        </label>

        {form.isSponsored && (
          <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
            <div>
              <label className={labelCls}>Sponsor Name</label>
              <input
                type="text"
                value={form.sponsorName}
                onChange={(e) => update('sponsorName', e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Sponsor Logo URL</label>
              <input
                type="text"
                value={form.sponsorLogoUrl}
                onChange={(e) => update('sponsorLogoUrl', e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Sponsor URL</label>
              <input
                type="text"
                value={form.sponsorUrl}
                onChange={(e) => update('sponsorUrl', e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Terms & Conditions</label>
              <input
                type="text"
                value={form.termsAndConditions}
                onChange={(e) => update('termsAndConditions', e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 pt-4 border-t border-border">
          <button
            type="submit"
            disabled={submitting}
            className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground px-5 py-2 text-sm font-medium rounded-sm uppercase tracking-wide"
          >
            {submitting ? 'Creating...' : 'Create Challenge'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/challenges')}
            className="px-5 py-2 text-sm font-medium text-muted-foreground border border-border rounded-sm uppercase tracking-wide hover:bg-muted"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};