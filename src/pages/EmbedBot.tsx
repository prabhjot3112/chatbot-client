import { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import Chatbot1 from '../components/Chatbot1';

const EmbedBot = () => {
  useEffect(() => {
    // make sure the iframe body fills viewport
    document.documentElement.style.height = '100%';
    document.documentElement.style.margin = '0';
    document.body.style.height = '100vh';
    document.body.style.margin = '0';
    document.body.style.position = 'relative';
    document.body.style.overflow = 'hidden';
    document.body.style.background = 'transparent'; // optional
    document.body.style.outline = '2px solid red';
    
    
    const container = document.createElement('div');
    container.id = 'chatbot-container';
container.style.position = 'fixed'; // key!
container.style.bottom = '20px';
container.style.right = '20px';
container.style.width = '400px';
container.style.height = '600px';
container.style.zIndex = '99999';
    document.body.appendChild(container);

    const root = ReactDOM.createRoot(container);
    root.render(<Chatbot1 type="first" domain={'Plants and Trees'}/>);

    return () => {
      queueMicrotask(() => {
        root.unmount();
        container.remove();
      });
    };
  }, []);

  return null;
};

export default EmbedBot;
