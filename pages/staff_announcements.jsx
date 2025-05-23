import { useEffect, useState } from 'react';
import axios from 'axios';
import { requireAuth } from '../lib/auth';
import Topbar from '../components/Topbar';

export default function StaffAnnouncements({ user }) {
  const [announcements, setAnnouncements] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [popup, setPopup] = useState(null);
  const [modal, setModal] = useState(null);

  useEffect(() => {
    axios.get('/api/announcements?channel=staff').then(res => {
      setAnnouncements(res.data.announcements.filter(a => a.channel === 'staff'));
    });
  }, []);

  const canPost = user.level === 'owner' || user.level === 'superowner';
  const canDelete = user.level === 'owner' || user.level === 'superowner';

  const handlePost = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/announcements', { title, description, channel: 'staff' });
      setAnnouncements([res.data.announcement, ...announcements]);
      setTitle('');
      setDescription('');
      setPopup({ title: res.data.announcement.title, author: res.data.announcement.author });
      setTimeout(() => setPopup(null), 2500);
    } catch (e) {
      setError(e.response?.data?.error || 'Errore');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    setLoading(true);
    setError('');
    try {
      await axios.delete('/api/announcements', { data: { id } });
      setAnnouncements(announcements.filter(a => a.id !== id));
    } catch (e) {
      setError(e.response?.data?.error || 'Errore');
    }
    setLoading(false);
  };

  return (
    <div>
      <Topbar user={user} />
      <div style={{ maxWidth: 900, margin: '48px auto 0 auto', background: '#fff', borderRadius: 16, boxShadow: '0 4px 16px rgba(0,0,0,0.10)', padding: '40px 32px 32px 32px', border: '1px solid #e0e0e0', position: 'relative' }}>
        <h1>Staff Announcements</h1>
        <p>Announcements reserved for staff, admin, owner, and superowner.</p>
        <p style={{marginTop:24, color:'#555'}}>User: {user.username} (level: {user.level})</p>
        {canPost && (
          <div style={{marginTop:32, marginBottom:24}}>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={{width:'100%', padding:10, fontSize:16, borderRadius:8, border:'1px solid #ccc', marginBottom:8}}
              placeholder="Announcement title"
            />
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              style={{width:'100%', padding:12, fontSize:16, borderRadius:8, border:'1px solid #ccc'}}
              placeholder="Detailed description..."
            />
            <button
              onClick={handlePost}
              disabled={loading || !title.trim() || !description.trim()}
              style={{marginTop:8, background:'#1a73e8', color:'#fff', border:'none', borderRadius:8, padding:'10px 28px', fontWeight:600, fontSize:16, cursor:'pointer'}}
            >
              Publish Announcement
            </button>
            {error && <div style={{color:'#c0392b', marginTop:8}}>{error}</div>}
          </div>
        )}
        <div style={{marginTop:32}}>
          {announcements.length === 0 && <div style={{color:'#888'}}>No announcements available.</div>}
          {announcements.map(a => (
            <div key={a.id} style={{background:'#f7fafd', border:'1px solid #e0e0e0', borderRadius:8, marginBottom:18, padding:'14px 20px', position:'relative', cursor:'pointer'}} onClick={() => setModal(a)}>
              <div style={{fontWeight:600, fontSize:16, marginBottom:2}}>{a.title}</div>
              <div style={{fontSize:13, color:'#888'}}>Author: {a.author}</div>
              {canDelete && (
                <button onClick={e => {e.stopPropagation(); handleDelete(a.id);}} style={{position:'absolute', top:12, right:12, background:'#e53935', color:'#fff', border:'none', borderRadius:6, padding:'4px 12px', fontSize:13, cursor:'pointer'}}>Delete</button>
              )}
            </div>
          ))}
        </div>
        {popup && (
          <div style={{position:'fixed', top:40, left:'50%', transform:'translateX(-50%)', background:'#222', color:'#fff', borderRadius:10, padding:'18px 32px', fontSize:18, fontWeight:600, zIndex:10000, boxShadow:'0 4px 16px rgba(0,0,0,0.18)'}}>
            {popup.title}<br/>
            <span style={{fontSize:14, color:'#bbb'}}>Author: {popup.author}</span>
          </div>
        )}
        {modal && (
          <div style={{position:'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(0,0,0,0.25)', zIndex:10001, display:'flex', alignItems:'center', justifyContent:'center'}} onClick={() => setModal(null)}>
            <div style={{background:'#fff', borderRadius:14, padding:'32px 32px 24px 32px', minWidth:340, maxWidth:500, boxShadow:'0 4px 24px rgba(0,0,0,0.18)', position:'relative'}} onClick={e => e.stopPropagation()}>
              <div style={{fontWeight:700, fontSize:22, marginBottom:10}}>{modal.title}</div>
              <div style={{fontSize:16, marginBottom:18}}>{modal.description}</div>
              <div style={{fontSize:14, color:'#888'}}>Author: {modal.author}</div>
              <button onClick={() => setModal(null)} style={{position:'absolute', top:10, right:10, background:'#eee', border:'none', borderRadius:6, padding:'2px 10px', fontSize:15, cursor:'pointer'}}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export async function getServerSideProps(context) {
  return requireAuth('staff')(context);
}
