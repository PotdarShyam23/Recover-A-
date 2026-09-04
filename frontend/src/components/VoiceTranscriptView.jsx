import React from 'react';

export default function VoiceTranscriptView({ transcript, sentiment, summary }) {
  if (!transcript || !Array.isArray(transcript) || transcript.length === 0) {
    return null;
  }

  return (
    <div className="voice-transcript-card">
      <div className="voice-header">
        <div className="voice-tag">🎙️ Hinglish AI Voice Call Conversation</div>
        {sentiment && <span className="sentiment-badge">Sentiment: {sentiment}</span>}
      </div>

      <div className="chat-bubbles">
        {transcript.map((line, idx) => {
          const isAgent = line.speaker === 'Agent';
          return (
            <div key={idx} className={`chat-bubble-row ${isAgent ? 'agent-row' : 'customer-row'}`}>
              <div className={`chat-bubble ${isAgent ? 'agent-bubble' : 'customer-bubble'}`}>
                <div className="speaker-label">{isAgent ? '🤖 RecoverAI Voice Agent' : '👤 Customer'}</div>
                <div className="bubble-text">{line.text}</div>
              </div>
            </div>
          );
        })}
      </div>

      {summary && (
        <div className="call-summary">
          <strong>AI Call Summary:</strong> {summary}
        </div>
      )}
    </div>
  );
}
