import { useState, useEffect } from 'react';
import { Target, Plus, Calendar, Users, Trophy } from 'lucide-react';
import { challengesApi } from '@/services/api/challenges';
import { useNavigate } from 'react-router-dom';

export const ChallengesPage = () => {
const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    challengesApi.getChallenges({}).then(res => setChallenges(res.data.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
       <h1 className="text-2xl font-bold tracking-tight text-foreground uppercase">Challenges Management</h1>
          <p className="text-sm text-muted-foreground font-mono">Create and monitor daily/weekly contests</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/challenges/create')}
            className="flex items-center gap-2 bg-[#3B82F6] hover:bg-blue-600 text-white px-4 py-2 text-sm font-medium transition-colors shadow-sm rounded-sm uppercase tracking-wide"
          >
            <Plus className="w-4 h-4" />
            Create Challenge
          </button>
        </div>
      </div>

     {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
         <div key={i} className="bg-card border border-border rounded-sm p-5 shadow-sm animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-sm bg-muted" />
                <div className="space-y-2">
                  <div className="h-3 w-32 bg-muted rounded" />
                  <div className="h-2 w-16 bg-muted/60 rounded" />
                </div>
              </div>
              <div className="space-y-3 mb-5">
                <div className="h-2 bg-muted/60 rounded w-full" />
                <div className="h-2 bg-muted/60 rounded w-3/4" />
                <div className="h-2 bg-muted/60 rounded w-1/2" />
              </div>
              <div className="h-7 bg-muted/60 rounded w-full mt-4 border-t border-border pt-4" />
            </div>
          ))}
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {challenges.length === 0 && (
        <div className="col-span-3 text-center py-16 text-muted-foreground font-mono text-sm">No challenges found</div>
        )}
        {challenges.map(challenge => (
        <div key={challenge.id} className="bg-card border border-border rounded-sm p-5 shadow-sm hover:border-primary/50 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-sm bg-accent text-primary flex items-center justify-center">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-card-foreground uppercase tracking-tight">{challenge.title}</h3>
                  <span className="text-[10px] font-mono bg-accent text-accent-foreground px-2 py-0.5 rounded-sm">{challenge.type}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3 mb-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-mono uppercase text-xs flex items-center gap-1"><Trophy className="w-3 h-3"/> Reward Pool</span>
                <span className="font-bold text-success">₹{challenge.rewardPool}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-mono uppercase text-xs flex items-center gap-1"><Users className="w-3 h-3"/> Participants</span>
                <span className="font-bold text-card-foreground">{challenge.participantCount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-mono uppercase text-xs flex items-center gap-1"><Calendar className="w-3 h-3"/> Status</span>
                <span className="font-medium text-card-foreground">{challenge.status}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-border">
              <button 
                onClick={() => navigate(`/challenges/${challenge.id}`)}
                className="flex-1 bg-muted hover:bg-muted/70 text-card-foreground border border-border py-1.5 text-xs font-bold uppercase tracking-wide transition-colors"
              >
                Manage
              </button>
            </div>
          </div>
     ))}
      </div>
      )}
    </div>
  );
};
