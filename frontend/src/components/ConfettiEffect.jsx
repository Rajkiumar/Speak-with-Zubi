export default function ConfettiEffect({ show }) {
  if (!show) return null;

  return (
    <div className="confetti-banner">
      🎉🎉🎉 Great Job! 🎉🎉🎉
    </div>
  );
}