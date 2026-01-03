const SectionTitle = ({ title, subtitle }) => (
  <div className="section-title">
    <h3>{title}</h3>
    {subtitle && <p>{subtitle}</p>}
    <span className="section-title__line" />
  </div>
);

export default SectionTitle;
