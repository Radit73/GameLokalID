import { Link } from 'react-router-dom';
import RatingBadge from './RatingBadge.jsx';

const GameCard = ({ game, compact = false }) => {
  const targetLink = game.link || `/games/${game.id || 1}`;
  const cover = game.cover || game.cover_image || 'https://via.placeholder.com/320x180';
  const badgeRating =
    typeof game.rating !== 'undefined'
      ? game.rating
      : game.avg_rating
        ? Number(game.avg_rating).toFixed(1)
        : 'NEW';
  const genreLabel = game.genre || game.genres || '';

  return (
    <Link to={targetLink} className="game-card__link">
      <div className={`game-card card ${compact ? 'game-card--compact' : ''}`}>
        <div className="game-card__cover">
          <img src={cover} alt={game.title} />
          <RatingBadge rating={badgeRating} />
        </div>
        <div className="game-card__body">
          <h4>{game.title}</h4>
          <p>{game.developer || 'Developer Lokal'}</p>
          {genreLabel && <span className="game-card__genre">{genreLabel}</span>}
        </div>
      </div>
    </Link>
  );
};

export default GameCard;
