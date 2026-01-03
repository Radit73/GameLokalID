import { getAuth } from '../../utils/auth.js';

const baseMenu = [
  { label: 'Dashboard', path: '/admin' },
  { label: 'Kelola Game', path: '/admin/games' },
  { label: 'Kelola Review', path: '/admin/reviews' },
];

const SidebarAdmin = ({ active }) => {
  const auth = getAuth();
  const menuItems =
    auth?.user?.role === 'SUPER_ADMIN'
      ? [...baseMenu, { label: 'Logs', path: '/admin/logs' }]
      : baseMenu;

  return (
    <aside className="sidebar-admin">
      <div className="sidebar-admin__brand">GameLokalID</div>
      <ul>
        {menuItems.map((item) => (
          <li
            key={item.label}
            className={active === item.label ? 'active' : undefined}
          >
            <a href={item.path}>{item.label}</a>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default SidebarAdmin;
