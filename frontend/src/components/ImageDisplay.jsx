export default function ImageDisplay({ highlightedObject, imageUrl }) {
  const isHighlighted = Boolean(highlightedObject);

  return (
    <div className="image-wrap">
      <img
        src={imageUrl || "/jungle.png"}
        alt="Jungle Scene"
        className={`main-image ${isHighlighted ? "is-highlighted" : ""}`}
      />

      <div className={`highlight-pill ${isHighlighted ? "active" : ""}`}>
        {highlightedObject
          ? `Highlighted: ${highlightedObject}`
          : "No highlighted object yet"}
      </div>
    </div>
  );
}