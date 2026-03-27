export default function LoadingSpinner({ size = 'md', text }) {
  return (
    <div className="loading-page">
      <div className={`spinner ${size === 'lg' ? 'spinner-lg' : ''}`} />
      {text && <p className="text-small">{text}</p>}
    </div>
  );
}
