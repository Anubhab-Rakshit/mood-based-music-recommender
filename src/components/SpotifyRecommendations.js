import '../styles/SpotifyRecommendations.css';
const SpotifyRecommendations = ({ recommendations }) => {
    if (!recommendations || !Array.isArray(recommendations)) {
      return <p>No recommendations available</p>;
    }
  
    return (
      <div className="spotify-recommendations">
        <h2 className="recommendations-title">Recommended Songs</h2>
        <ul className="recommendations-list">
          {recommendations.map((track, index) => (
            <li key={index} className="recommendation-item">
              <span className="track-name">{track.name}</span> by 
              <span className="track-artist"> {track.artist}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };
  
  export default SpotifyRecommendations;
  