const StatCard = ({ label, value, icon }) => (
  <div className="stat-card card">
    <div className="stat-card__icon">{icon}</div>
    <div>
      <p className="stat-card__label">{label}</p>
      <h3>{value}</h3>
    </div>
  </div>
);

export default StatCard;
