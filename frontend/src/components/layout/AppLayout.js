import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

const NAV = [
  { path:'/',        label:'Home',    icon:(a)=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a?2.5:2} strokeLinecap="round"><path d="M3 12L12 3l9 9"/><path d="M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9"/></svg> },
  { path:'/parties', label:'Parties', icon:(a)=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a?2.5:2} strokeLinecap="round"><circle cx="9" cy="7" r="4"/><path d="M2 21v-2a7 7 0 0114 0v2"/><path d="M19 8v6M16 11h6"/></svg> },
  { path:'/staff',   label:'Staff',   icon:(a)=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a?2.5:2} strokeLinecap="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M8 4v16M3 9h5M3 14h5M13 9h8M13 14h8"/></svg> },
  { path:'/reports', label:'Reports', icon:(a)=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a?2.5:2} strokeLinecap="round"><path d="M18 20V10M12 20V4M6 20v-6"/></svg> },
  { path:'/profile', label:'More',    icon:(a)=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a?2.5:2} strokeLinecap="round"><circle cx="12" cy="5" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="19" r="1" fill="currentColor"/></svg> },
];

export default function AppLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { online, queueLen } = useOnlineStatus();
  const isActive = (p) => p==='/' ? pathname==='/' : pathname.startsWith(p);

  return (
    <div style={{ maxWidth:'var(--maxw)', margin:'0 auto', minHeight:'100vh', background:'var(--bg)', position:'relative' }}>
      {/* Offline / Syncing banner */}
      {!online && (
        <div style={{ position:'sticky', top:0, zIndex:500, background:'#f57c00', color:'white', textAlign:'center', padding:'7px 16px', fontSize:12, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
          <span>📵</span>
          <span>You're offline — changes saved locally{queueLen > 0 ? ` (${queueLen} pending)` : ''}</span>
        </div>
      )}
      {online && queueLen > 0 && (
        <div style={{ position:'sticky', top:0, zIndex:500, background:'#1a9e5c', color:'white', textAlign:'center', padding:'7px 16px', fontSize:12, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
          <span>🔄</span>
          <span>Syncing {queueLen} offline {queueLen === 1 ? 'change' : 'changes'}…</span>
        </div>
      )}
      <Outlet />
      <nav className="bottom-nav" style={{ height: 'var(--nav-h)' }}>
        {NAV.map(item => {
          const active = isActive(item.path);
          return (
            <button key={item.path} className={`nav-item${active?' active':''}`} onClick={() => navigate(item.path)}>
              {item.icon(active)}
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Top-right toolbar: Calculator */}
      <button
        onClick={() => navigate('/calculator')}
        title="Calculator"
        style={{
          position:'fixed', top:14, right:66, width:40, height:40, borderRadius:'50%',
          background:'linear-gradient(135deg,#1a4fd6,#0e2a8a)', border:'none', color:'white',
          fontSize:18, cursor:'pointer', boxShadow:'0 2px 12px rgba(26,79,214,.35)',
          zIndex:398, display:'flex', alignItems:'center', justifyContent:'center',
        }}
      >
        🧮
      </button>
    </div>
  );
}
