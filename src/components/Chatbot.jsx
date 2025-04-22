import { useState, useRef, useEffect } from 'react';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hello! I'm your AWS Security Assistant. How can I help you with your security monitoring today?", sender: 'bot' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (inputText.trim() === '') return;

    // Add user message
    const userMessage = { text: inputText, sender: 'user' };
    setMessages([...messages, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate API call delay
    setTimeout(() => {
      // Here you would normally fetch from an actual API
      let botResponse;
      
      if (inputText.toLowerCase().includes('threat')) {
        botResponse = { 
          text: "I see you're asking about threats. There are currently 12 critical threats detected in the last hour. Would you like more details on any specific threat category?", 
          sender: 'bot' 
        };
      } else if (inputText.toLowerCase().includes('incident')) {
        botResponse = { 
          text: "We have 189 resolved incidents today with 8 new resolutions. Would you like to see the incident report or investigate any specific incidents?", 
          sender: 'bot' 
        };
      } else if (inputText.toLowerCase().includes('ec2') || inputText.toLowerCase().includes('s3')) {
        botResponse = { 
          text: "I see you're asking about AWS services. EC2 has the highest number of security events (65) followed by S3 (41). Would you like to see remediation recommendations?", 
          sender: 'bot' 
        };
      } else {
        botResponse = { 
          text: "I can help you monitor security threats, investigate incidents, and provide recommendations. What specific security aspect are you interested in today?", 
          sender: 'bot' 
        };
      }
      
      setMessages(prevMessages => [...prevMessages, botResponse]);
      setIsTyping(false);
    }, 1000);
  };

  // Auto scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chatbot button - now larger */}
      <button 
        onClick={toggleChatbot}
        className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 w-16 h-16"
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>

      {/* Chatbot window - now larger and more stylish */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-96 bg-white rounded-3xl shadow-4xl overflow-hidden border border-gray-200 transition-all duration-300">
          {/* Header with AWS-inspired styling */}
          <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white px-5 py-4 flex justify-between items-center">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <h3 className="font-medium text-lg">AWS Security Assistant</h3>
            </div>
            <button onClick={toggleChatbot} className="text-white hover:text-gray-200 focus:outline-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          {/* Messages - better styled */}
          <div className="h-96 overflow-y-auto p-5 bg-gray-50">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`mb-4 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}
              >
                <div 
                  className={`inline-block p-3 rounded-lg max-w-xs lg:max-w-md ${
                    message.sender === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-none shadow-md' 
                      : 'bg-white text-gray-800 rounded-bl-none shadow-md border border-gray-200'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="text-left mb-4">
                <div className="inline-block p-3 rounded-lg bg-white text-gray-800 rounded-bl-none shadow-md border border-gray-200">
                  <div className="flex space-x-2">
                    <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-bounce"></div>
                    <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input - larger and more prominent */}
          <form onSubmit={sendMessage} className="border-t border-gray-200 p-3 flex bg-white">
            <input
              type="text"
              value={inputText}
              onChange={handleInputChange}
              placeholder="Ask about security threats, incidents, or services..."
              className="flex-1 px-4 py-3 text-base border border-gray-300 rounded-l-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button 
              type="submit"
              className="bg-blue-600 text-white px-5 py-3 rounded-r-xl hover:bg-blue-700 focus:outline-none transition-colors duration-300 flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
          
          {/* Quick action buttons */}
          <div className="bg-gray-50 px-3 py-2 flex space-x-2 overflow-x-auto">
            <button 
              onClick={() => {
                setInputText("Show critical threats");
                document.querySelector('form button[type="submit"]').click();
              }}
              className="bg-white text-blue-600 border border-blue-200 px-3 py-1.5 rounded-full text-sm hover:bg-blue-50 whitespace-nowrap shadow-sm"
            >
              Critical threats
            </button>
            <button 
              onClick={() => {
                setInputText("Recent incidents");
                document.querySelector('form button[type="submit"]').click();
              }}
              className="bg-white text-blue-600 border border-blue-200 px-3 py-1.5 rounded-full text-sm hover:bg-blue-50 whitespace-nowrap shadow-sm"
            >
              Recent incidents
            </button>
            <button 
              onClick={() => {
                setInputText("EC2 vulnerabilities");
                document.querySelector('form button[type="submit"]').click();
              }}
              className="bg-white text-blue-600 border border-blue-200 px-3 py-1.5 rounded-full text-sm hover:bg-blue-50 whitespace-nowrap shadow-sm"
            >
              EC2 issues
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;