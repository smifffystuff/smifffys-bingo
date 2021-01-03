import React, { useRef } from 'react';
import { InputGroup, FormControl, Button } from 'react-bootstrap';

import { useDatabase } from '../../context/DatabaseContext';
import { useFunctions } from '../../context/FunctionsContext';
import ChatMessage from './ChatMessage';

const ChatPanel = () => {
  const { chatMessages, currentGame } = useDatabase();
  const { sendChatMessage } = useFunctions();
  const msgRef = useRef();

  const handleSendMessage = async e => {
    e.preventDefault();
    if (!msgRef.current.value) {
      return;
    }
    console.log('sending message', msgRef.current.value);
    await sendChatMessage(currentGame.id, msgRef.current.value);
    msgRef.current.value = '';
  };
  return (
    <div className="border border-secondary px-3" style={{ minWidth: '300px' }}>
      <InputGroup className="mb-3">
        <FormControl ref={msgRef} placeholder="Message" />
        <InputGroup.Append>
          <Button variant="info" onClick={handleSendMessage}>
            Send
          </Button>
        </InputGroup.Append>
      </InputGroup>
      {chatMessages.map(msg => (
        <ChatMessage key={msg.id} msg={msg} />
      ))}
    </div>
  );
};

export default ChatPanel;
