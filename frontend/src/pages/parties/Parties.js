import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { api } from '../../utils/offlineDB';
import { fmt, avatarColor, avatarLetter } from '../../utils/helpers';

export default function Parties() {
  const navigate = useNavigate();
  const [parties, setParties] = useState([]);
  const [totals,  setTotals]  = useState({});
  const [search,  setSearch]  = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pR, tR] = await Promise.all([
        api.get(axios, '/api/parties', { params: search ? { search } : {} }),
        api.get(axios, '/api/parties/summary/totals'),
      ]);
      setParties(pR.data.data);
      setTotals(tR.data.data);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { load(); }, [load]);

  // Group parties by type
  const grouped = parties.reduce((acc, p) => {
    const t = p.type || 'other';
    if (!acc[t]) acc[t] = [];
    acc[t].push(p);
    return acc;
  }, {});
  const typeKeys = Object.keys(grouped).sort();

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', paddingBottom:90 }}>
      {/* Header */}
      <div className="grad-blue" style={{ padding:'18px 16px 0', color:'white' }}>
        <h2 style={{ fontSize:20, fontWeight:800, marginBottom:14 }}>🤝 All Parties</h2>
        {/* Summary */}
        <div style={{ background:'rgba(255,255,255,.13)', borderRadius:14, padding:'12px 16px', display:'flex', marginBottom:16 }}>
          <div style={{ flex:1, borderRight:'1px solid rgba(255,255,255,.2)', paddingRight:14 }}>
            <p style={{ fontSize:11, opacity:.75, marginBottom:2 }}>You will give</p>
            <p style={{ fontSize:22, fontWeight:800 }}>₹{fmt(totals.totalToGive||0,0)}</p>
          </div>
          <div style={{ flex:1, paddingLeft:14 }}>
            <p style={{ fontSize:11, opacity:.75, marginBottom:2 }}>You will get</p>
            <p style={{ fontSize:22, fontWeight:800 }}>₹{fmt(totals.totalToGet||0,0)}</p>
          </div>
        </div>
      </div>

      <div style={{ padding:'14px 14px 0' }}>
        <div className="searchbar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input placeholder="Search parties…" value={search} onChange={e=>setSearch(e.target.value)} />
          {search && <button onClick={()=>setSearch('')} style={{ color:'var(--text3)', fontSize:18 }}>×</button>}
        </div>

        {loading ? <div className="spinner"><div className="spin"/></div>
        : parties.length === 0 ? (
          <div className="empty">
            <div className="ico">🤝</div>
            <h3>No parties yet</h3>
            <p>Tap below to add your first party (customer, supplier, friend, etc.)</p>
          </div>
        ) : typeKeys.map(type => (
          <div key={type}>
            <p className="sec-title" style={{ textTransform:'capitalize', marginTop:10 }}>{type} <span style={{ fontSize:11, fontWeight:600, color:'var(--text3)', marginLeft:4 }}>({grouped[type].length})</span></p>
            {grouped[type].map(p=>(
              <div key={p._id} className="list-item" onClick={()=>navigate(`/parties/${p._id}`)}>
                <div className="avatar" style={{ background:avatarColor(p.name) }}>{avatarLetter(p.name)}</div>
                <div className="li-info">
                  <h3>{p.name}</h3>
                  <p>{p.phone||'No phone'}</p>
                </div>
                <div className="li-right">
                  <p className={p.balance>=0?'get':'give'} style={{ fontSize:16 }}>₹{fmt(Math.abs(p.balance),2)}</p>
                  <p style={{ fontSize:10, color:'var(--text4)', marginTop:2 }}>
                    {p.balance>0?'will get':p.balance<0?'will give':'settled'}
                  </p>
                  {p.balance>0 && <p style={{ fontSize:10, color:'var(--blue)', fontWeight:700, marginTop:2 }}>REMIND ›</p>}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <button className="fab fab-pink" onClick={()=>navigate('/parties/add')}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
        ADD PARTY
      </button>
    </div>
  );
}
