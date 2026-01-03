import { useEffect, useState } from 'react';
import SidebarAdmin from '../../components/layout/SidebarAdmin.jsx';
import SectionTitle from '../../components/ui/SectionTitle.jsx';
import { getLogs } from '../../api.js';
import { getAuth, getToken } from '../../utils/auth.js';
import { getTheme } from '../../utils/theme.js';

const Logs = () => {
  const [auth, setAuth] = useState(getAuth());
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [theme, setTheme] = useState(() => getTheme());

  useEffect(() => {
    const handleAuthChange = () => setAuth(getAuth());
    window.addEventListener('auth-changed', handleAuthChange);
    return () => window.removeEventListener('auth-changed', handleAuthChange);
  }, []);

  useEffect(() => {
    const handleThemeChange = () => setTheme(getTheme());
    window.addEventListener('theme-changed', handleThemeChange);
    return () => window.removeEventListener('theme-changed', handleThemeChange);
  }, []);

  useEffect(() => {
    const body = document.body;
    body.classList.add('theme-page-admin');
    if (theme === 'light') {
      body.classList.add('theme-light');
    } else {
      body.classList.remove('theme-light');
    }
    return () => {
      body.classList.remove('theme-page-admin');
      body.classList.remove('theme-light');
    };
  }, [theme]);

  useEffect(() => {
    const fetchLogs = async () => {
      if (!auth || auth.user.role !== 'SUPER_ADMIN') return;
      try {
        const data = await getLogs(getToken(), 200);
        setLogs(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [auth]);

  if (!auth || auth.user.role !== 'SUPER_ADMIN') {
    return (
      <div className={`admin-layout ${theme === 'light' ? 'theme-light' : ''}`}>
        <SidebarAdmin active="Logs" />
        <main className="admin-content">
          <p className="error-text">Akses ditolak. Hanya super admin yang dapat melihat log.</p>
        </main>
      </div>
    );
  }

  return (
    <div className={`admin-layout ${theme === 'light' ? 'theme-light' : ''}`}>
      <SidebarAdmin active="Logs" />
      <main className="admin-content">
        <h1>Log Aktivitas</h1>
        <p className="muted-text">
          Riwayat aksi penting dari pengguna, admin, dan super admin. Data ditampilkan 200 entri terbaru.
        </p>

        {error && <p className="error-text">{error}</p>}

        <div className="card" style={{ marginTop: '1.5rem' }}>
          <SectionTitle
            title="Aktivitas Terbaru"
            subtitle="Sumber: aksi login, CRUD game, dan review."
          />

          {loading ? (
            <p>Sedang memuat log...</p>
          ) : logs.length === 0 ? (
            <p>Tidak ada log untuk ditampilkan.</p>
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Waktu</th>
                    <th>Pengguna</th>
                    <th>Aksi</th>
                    <th>Target</th>
                    <th>Detail</th>
                    <th>IP</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td>{new Date(log.created_at).toLocaleString()}</td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span>{log.user_name || 'Tidak dikenal'}</span>
                          <span className="muted-text" style={{ fontSize: '0.85rem' }}>
                            {log.user_email || '-'} ({log.role || 'N/A'})
                          </span>
                        </div>
                      </td>
                      <td>{log.action}</td>
                      <td>
                        {log.entity_type || '-'}
                        {log.entity_id ? ` #${log.entity_id}` : ''}
                      </td>
                      <td>
                        {log.meta ? (
                          <code style={{ fontSize: '0.85rem' }}>
                            {JSON.stringify(log.meta)}
                          </code>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td>{log.ip || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Logs;
