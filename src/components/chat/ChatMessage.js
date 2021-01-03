import React from 'react';

import { useAuth } from '../../context/AuthContext';

const ChatMessage = ({ msg }) => {
  const { currentUser } = useAuth();

  const msgClass = currentUser.uid === msg.userId ? 'sent' : 'received';

  return (
    <div className={`chat-message ${msgClass}`}>
      <div>
        <div className="sender">
          {currentUser.uid === msg.userId ? 'me' : msg.userName}
        </div>
        <p>{msg.message}</p>
      </div>
    </div>
  );
};

export default ChatMessage;
