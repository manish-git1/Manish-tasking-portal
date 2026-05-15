'use client';
import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate, formatRelative } from '@/lib/utils';
import { CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Request {
  _id: string; status: string; reason: string; reviewNote?: string;
  originalDeadline: string; newDeadline: string; createdAt: string;
  task: { _id: string; title: string; status: string };
  requestedBy: { name: string; email: string; department?: string };
  reviewedBy?: { name: string };
}

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState<Request | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/admin/requests?status=${filter}`);
      setRequests(data.data.requests);
    } finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        {['pending', 'approved', 'rejected', 'all'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${filter === s ? 'gradient-brand text-white' : 'bg-accent text-muted-foreground hover:text-foreground'}`}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {loading ? [...Array(3)].map((_, i) => <div key={i} className="h-28 bg-card border border-border rounded-2xl shimmer" />) :
          requests.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-12 text-center text-muted-foreground">No {filter} requests</div>
          ) : requests.map((r, i) => (
            <motion.div key={r._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-2xl p-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{r.task?.title}</span>
                    <Badge variant={r.status}>{r.status}</Badge>
                    <Badge variant={r.task?.status}>{r.task?.status?.replace('_', ' ')}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Requested by <span className="font-medium text-foreground">{r.requestedBy?.name}</span> ({r.requestedBy?.department || r.requestedBy?.email}) · {formatRelative(r.createdAt)}</p>
                  <p className="text-sm mt-1"><span className="text-muted-foreground">Reason:</span> {r.reason}</p>
                  <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                    <span>Original: <span className="text-foreground font-medium">{formatDate(r.originalDeadline)}</span></span>
                    <span>Requested: <span className="text-primary font-medium">{formatDate(r.newDeadline)}</span></span>
                  </div>
                  {r.reviewNote && <p className="text-xs text-muted-foreground mt-1">Note: {r.reviewNote}</p>}
                  {r.reviewedBy && <p className="text-xs text-muted-foreground">Reviewed by {r.reviewedBy.name}</p>}
                </div>
                {r.status === 'pending' && (
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" variant="ghost" onClick={() => setReviewModal(r)} className="text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                      <CheckCircle className="w-4 h-4" /> Approve
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setReviewModal({ ...r, _id: r._id + '|reject' })} className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20">
                      <XCircle className="w-4 h-4" /> Reject
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
      </div>

      {reviewModal && (
        <ReviewModal
          request={reviewModal}
          onClose={() => setReviewModal(null)}
          onDone={() => { setReviewModal(null); fetchRequests(); }}
        />
      )}
    </div>
  );
}

function ReviewModal({ request, onClose, onDone }: { request: Request; onClose: () => void; onDone: () => void }) {
  const isReject = request._id.includes('|reject');
  const id = request._id.replace('|reject', '');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const submit = async () => {
    setSaving(true);
    try {
      await axios.patch(`/api/admin/requests/${id}`, { status: isReject ? 'rejected' : 'approved', reviewNote: note });
      toast.success(`Request ${isReject ? 'rejected' : 'approved'}!`);
      onDone();
    } catch { toast.error('Failed'); }
    finally { setSaving(false); }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h2 className="text-lg font-bold mb-2">{isReject ? 'Reject' : 'Approve'} Reschedule Request</h2>
        <p className="text-sm text-muted-foreground mb-4">Task: <span className="text-foreground font-medium">{request.task?.title}</span></p>
        <textarea value={note} onChange={e => setNote(e.target.value)} placeholder={isReject ? 'Reason for rejection (optional)' : 'Note for member (optional)'} rows={3}
          className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none mb-4" />
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className={`flex-1 ${isReject ? 'bg-rose-500 hover:bg-rose-600' : ''}`} isLoading={saving} onClick={submit}>
            {isReject ? 'Reject Request' : 'Approve Request'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
