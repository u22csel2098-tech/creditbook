import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { api } from '../../utils/offlineDB';
import toast from 'react-hot-toast';

const SUGGESTIONS = ['Customer', 'Supplier', 'Friend', 'Family', 'Employee', 'Partner'];

export default function AddParty() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:'', type:'', phone:'', email:'', address:'', notes:'' });
  const [loading, setLoading] = useState(false);
  const [existingTypes, setExistingTypes] = useState([]);
  const set = k => e => setForm(f=>({...f,[k]:e.target.value}));

  useEffect(() => {
    api.get(axios, '/api/parties').then(r => {
      const types = [...new Set(r.data.data.map(p => p.type).filter(Boolean))];
      setExistingTypes(types);
    }).catch(()=>{});
  }, []);

  const allSuggestions = [...new Set([...SUGGESTIONS.map(s=>s.toLowerCase()), ...existingTypes])];

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Name is required');
    if (!form.type.trim()) return toast.error('Party type is required');
    setLoading(true);
    try {
      const r = await api.post(axios, '/api/parties', form);
      toast.success(`${form.type.charAt(0).toUpperCase()+form.type.slice(1)} added!`);
      navigate(`/parties/${r.data.data._id}`, { replace:true });
    } catch(err) { toast.error(err.response?.data?.message||'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh' }}>
      <div style={{ background:'linear-gradient(135deg,#1a4fd6,#0e2a8a)', padding:'16px 16px 24px', color:'white' }}>
        <div className="hdr-row">
          <button className="back-btn" onClick={()=>navigate(-1)}>←</button>
          <h2 style={{ fontSize:18, fontWeight:800, margin:0 }}>Add Party</h2>
        </div>
      </div>
      <form onSubmit={submit} style={{ padding:16 }}>
        <div className="field">
          <label>Name *</label>
          <input placeholder="Full name" value={form.name} onChange={set('name')} autoFocus />
        </div>
        <div className="field">
          <label>Party Type *</label>
          <input
            placeholder="e.g. customer, supplier, friend…"
            value={form.type}
            onChange={set('type')}
            list="type-suggestions"
          />
          <datalist id="type-suggestions">
            {allSuggestions.map(s => <option key={s} value={s} />)}
          </datalist>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginTop:8 }}>
            {allSuggestions.map(s => (
              <button
                key={s}
                type="button"
                onClick={()=>setForm(f=>({...f,type:s}))}
                style={{
                  padding:'4px 12px', borderRadius:50, fontSize:12, fontWeight:600, cursor:'pointer',
                  background: form.type===s ? 'var(--blue)' : 'var(--blue-lt)',
                  color: form.type===s ? 'white' : 'var(--blue)',
                  border: `1.5px solid ${form.type===s?'var(--blue)':'var(--blue-md)'}`,
                }}
              >{s}</button>
            ))}
          </div>
        </div>
        <div className="field"><label>Phone Number</label><input type="tel" placeholder="Mobile (optional)" value={form.phone} onChange={set('phone')} inputMode="numeric" /></div>
        <div className="field"><label>Email</label><input type="email" placeholder="Email (optional)" value={form.email} onChange={set('email')} /></div>
        <div className="field"><label>Address</label><input placeholder="Address (optional)" value={form.address} onChange={set('address')} /></div>
        <div className="field"><label>Notes</label><textarea rows={3} placeholder="Any notes…" value={form.notes} onChange={set('notes')} /></div>
        <button type="submit" className="btn btn-full btn-primary" style={{ padding:15, marginTop:6 }} disabled={loading}>
          {loading ? 'Adding…' : 'Add Party'}
        </button>
      </form>
    </div>
  );
}
