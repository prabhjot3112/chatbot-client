import React, { useState, } from 'react';
import ChatBotLogo from '../assets/chatbot_1.png';
import ChatWindow from './ChatWindow';
import { ChatbotOptions } from '../ChatbotOptions';

interface propType extends ChatbotOptions{
  type:string
}

const Chatbot1: React.FC<propType> = (props) => {
  const [isBotOpened, setIsBotOpened] = useState(false);

  return !isBotOpened ? (
    <div onClick={() => setIsBotOpened(true)} className="fixed bottom-5 right-5 cursor-pointer">
      <img src={ChatBotLogo} className="w-14 h-14 animate-bounce" />
    </div>
  ) : (
    <ChatWindow apiSchema={props.apiSchema} theme={props.theme} chatbotName={props.chatbotName} setIsBotOpened={setIsBotOpened} domain={props.domain} data={props.data}/>
  );
};

export default Chatbot1;
