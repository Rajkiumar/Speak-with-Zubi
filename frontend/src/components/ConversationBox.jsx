export default function ConversationBox({ text, userText }) {
  return (
    <div className="conversation-box">
      <p>
        <strong>Zubi:</strong> {text || ""}
      </p>
      {userText ? (
        <p>
          <strong>You:</strong> {userText}
        </p>
      ) : null}
    </div>
  );
}