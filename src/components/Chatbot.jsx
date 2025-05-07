import { useState, useRef, useEffect } from 'react';
 
const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hello! I'm your AWS Security Assistant. How can I help you with your security monitoring today?", sender: 'bot' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [pendingSOP, setPendingSOP] = useState(null);
  const [isRemediation, setIsRemediation] = useState(false);
  // const [data,setData] = useState()
  const messagesEndRef = useRef(null);
 
  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };
 
  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };
  
  // Format SOP steps with proper styling
  const formatSOPMessage = (responseData) => {
    if (!responseData) return "No response data available";
    
    let formattedMessage = "";
    
    // Add automatic SOP steps if available
    if (responseData.sop_steps && responseData.sop_steps.length > 0 && responseData.is_remediation===true) {
      formattedMessage += "## Automatic SOP Steps\n";
      formattedMessage += "These steps will be performed automatically if you choose to proceed:\n\n";
      responseData.sop_steps.forEach((step, index) => {
        formattedMessage += `${index + 1}. ${step}\n`;
      });
      formattedMessage += "\n";
    }
    
    // Add critical SOP steps if available
    if (responseData.critical_sop_steps && responseData.critical_sop_steps.length > 0) {
      formattedMessage += "## Critical Manual Steps\n";
      formattedMessage += "These steps require manual intervention:\n\n";
      responseData.critical_sop_steps.forEach((step, index) => {
        formattedMessage += `${index + 1}. ${step}\n`;
      });
      formattedMessage += "\n";
    }
    
    // Add parameters if available
    if (responseData.parameters && Object.keys(responseData.parameters).length > 0) {
      formattedMessage += "## Parameters\n";
      for (const [key, value] of Object.entries(responseData.parameters)) {
        formattedMessage += `- **${key}**: ${value}\n`;
      };
      formattedMessage += "\n";
    }
    
    return formattedMessage;
  };

  // Handle SOP confirmation responses
  const handleConfirmation = async (confirmed) => {
    if (!pendingSOP) return;
    
    if (confirmed) {
      // Add a message showing that remediation is in progress
      setMessages(prevMessages => [...prevMessages, 
        { text: "Initiating remediation process...", sender: 'bot' }
      ]);
      setIsRemediation(true);
      setIsTyping(true);
      
      try {
        // Call the remediation lambda function
        const remediationResult = await executeRemediation(pendingSOP);
        
        // Add the remediation result to chat
        setMessages(prevMessages => [...prevMessages, 
          { text: `Remediation complete: ${remediationResult}`, sender: 'bot' }
        ]);
      } catch (error) {
        // Handle errors in remediation
        setMessages(prevMessages => [...prevMessages, 
          { text: "There was an error executing the remediation steps. Please try again or contact support.", sender: 'bot' }
        ]);
      } finally {
        setIsTyping(false);
        setAwaitingConfirmation(false);
        setPendingSOP(null);
        setIsRemediation(false);
      }
    } else {
      // User declined to perform remediation
      setMessages(prevMessages => [...prevMessages, 
        { text: "Remediation cancelled. Please let me know if you need any other assistance.", sender: 'bot' }
      ]);
      setAwaitingConfirmation(false);
      setPendingSOP(null);
    }
  };
 
  const sendMessage = async (e) => {
    e?.preventDefault();
    if (inputText.trim() === '') return;
 
    // Add user message
    const userMessage = { text: inputText, sender: 'user' };
    setMessages([...messages, userMessage]);
    const currentInput = inputText;
    setInputText('');
    
    setIsTyping(true);
 
    try {
      // Make actual API call to your backend
      const response = await fetchResponseFromBackend(currentInput);
      
      // Handle SOP-related responses
      if (response && typeof response === 'object') {
        // Check if any SOP steps are available (either regular or critical)
        const hasSopSteps = 
          (response.sop_steps && response.sop_steps.length > 0) || 
          (response.critical_sop_steps && response.critical_sop_steps.length > 0);
        
        if (hasSopSteps) {
          // Store the response for later execution
          setPendingSOP(response);
          
          // Format the SOP steps as a structured message
          const formattedSOP = formatSOPMessage(response);
          
          // Only add SOP formatted message if there are actual steps to show
          if (formattedSOP.trim() !== '') {
            const botResponse = { 
              text: formattedSOP,
              sender: 'bot'
            };
            setMessages(prevMessages => [...prevMessages, botResponse]);
          }
          
          // Check for follow-up questions specifically asking for confirmation
          const hasConfirmationQuestion = response.follow_up_questions && 
            response.follow_up_questions.some(q => 
              q.toLowerCase().includes("would you like me to perform this step") ||
              q.toLowerCase().includes("perform this step")
            );
          
          if (hasConfirmationQuestion && response.is_remediation === true) {
            // Display the confirmation prompt separately with buttons
            const confirmationPrompt = {
              text: "Would you like me to perform these steps?",
              sender: 'bot',
              requiresConfirmation: true
            };
            setMessages(prevMessages => [...prevMessages, confirmationPrompt]);
            setAwaitingConfirmation(true);
          } else {
            // Display other follow-up questions as regular messages
            if (response.follow_up_questions && response.follow_up_questions.length > 0) {
              const followUpText = response.follow_up_questions.join('\n');
              const followUpResponse = {
                text: followUpText,
                sender: 'bot'
              };
              setMessages(prevMessages => [...prevMessages, followUpResponse]);
            }
          }
        } else {
          // Regular response with no SOP steps
          handleRegularResponse(response);
        }
      } else if (response && typeof response === 'string') {
        // Regular string response
        const botResponse = { 
          text: response,
          sender: 'bot'
        };
        setMessages(prevMessages => [...prevMessages, botResponse]);
      } else {
        // Handle empty or null response
        const botResponse = { 
          text: "I didn't get a proper response from the security service. Please try again.",
          sender: 'bot'
        };
        setMessages(prevMessages => [...prevMessages, botResponse]);
      }
    } catch (error) {
      // Handle error with a friendly message
      const errorResponse = {
        text: "I'm having trouble connecting to the security service. Please try again later.",
        sender: 'bot'
      };
      setMessages(prevMessages => [...prevMessages, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };
  
  // Handle regular (non-SOP) responses
  const handleRegularResponse = (response) => {
    // Check if it has follow-up questions
    if (response.follow_up_questions && response.follow_up_questions.length > 0) {
      // If there's a summary or other text content, show it first
      // if (response.summary) {
      //   const summaryResponse = {
      //     text: response.summary,
      //     sender: 'bot'
      //   };
      //   setMessages(prevMessages => [...prevMessages, summaryResponse]);
      // }
      
      // Then show follow-up questions
      const followUpText = response.follow_up_questions.join('\n');
      const followUpResponse = {
        text: followUpText,
        sender: 'bot'
      };
      setMessages(prevMessages => [...prevMessages, followUpResponse]);
    } else {
      // Handle regular response with no follow-up questions
      let responseText = '';
      
      // Try to get summary if available
      if (response.summary) {
        responseText = response.summary;
      } else {
        // Otherwise stringify the whole response
        responseText = JSON.stringify(response, null, 2);
      }
      
      const botResponse = { 
        text: responseText,
        sender: 'bot'
      };
      setMessages(prevMessages => [...prevMessages, botResponse]);
    }
  };
  
  // Function to execute remediation steps
  const executeRemediation = async (sopData) => {
    try {
      // Call the remediation lambda directly using its functional URL
      const response = await fetch('https://hrocbgcxjw3ph6p7yqs3w3uq4e0xxnhw.lambda-url.ap-south-1.on.aws/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sopSteps: sopData.sop_steps, parameters: sopData.parameters }),
      });
      if (!response.ok) {
        throw new Error('Remediation process failed');
      }
      
      const data = await response.json();
      return data.message || "Remediation completed successfully";
      
    } catch (error) {
      console.error("Error executing remediation:", error);
      throw error;
    }
  };
  
  // Function to fetch response from backend
  const fetchResponseFromBackend = async (query) => { 
    try { 
      // Get previous summary from local storage if available
      let previousSummary = '';
      const storedData = localStorage.getItem('chatbotData');
      
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        if (parsedData.summary) {
          previousSummary = parsedData.summary;
        }
      }
      
      // Make the API call to your AWS Lambda endpoint with query and previous summary
      const response = await fetch('https://gf6qcjn2cts46xxfzh5m3qlyuu0nmdza.lambda-url.ap-south-1.on.aws/', { 
        method: 'POST', 
        headers: { 
          'Content-Type': 'application/json', 
        }, 
        body: JSON.stringify({ 
          query: query,
          summary: previousSummary
        }), 
      }); 
       
      if (!response.ok) { 
        throw new Error('Network response was not ok'); 
      }
       
      const data = await response.json();
      console.log("response from the chatbot", data);
      
      // Store the response data in local storage
      localStorage.setItem('chatbotData', JSON.stringify(data));
      
      return data; 
       
    } catch (error) { 
      console.error("Error fetching from backend:", error); 
      throw error; 
    } 
  };

  // Auto scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Helper function to render message content with Markdown-like formatting
  const renderMessageContent = (text) => {
    if (!text) return null;
    
    // Split the text into lines to handle different parts
    const lines = text.split('\n');
    
    return lines.map((line, lineIndex) => {
      // Handle headings
      if (line.startsWith('## ')) {
        return (
          <h2 key={lineIndex} className="font-bold text-lg mt-2 mb-1">
            {line.replace('## ', '')}
          </h2>
        );
      }
      // Handle list items with numbers
      else if (line.match(/^\d+\.\s/)) {
        return (
          <div key={lineIndex} className="ml-4 my-1">
            {line}
          </div>
        );
      }
      // Handle bullet points
      else if (line.startsWith('- ')) {
        const content = line.replace('- ', '');
        // Check for bold text within bullet points
        if (content.includes('**')) {
          const parts = content.split('**');
          if (parts.length >= 3) {
            return (
              <div key={lineIndex} className="ml-4 my-1">
                • <strong>{parts[1]}</strong>{parts[2]}
              </div>
            );
          }
        }
        return (
          <div key={lineIndex} className="ml-4 my-1">
            • {content}
          </div>
        );
      }
      // Regular paragraph with possible bold text
      else if (line.trim() !== '') {
        if (line.includes('**')) {
          const parts = line.split('**');
          if (parts.length >= 3) {
            return (
              <p key={lineIndex} className={lineIndex > 0 ? 'mt-2' : ''}>
                {parts[0]}<strong>{parts[1]}</strong>{parts.slice(2).join('**')}
              </p>
            );
          }
        }
        return <p key={lineIndex} className={lineIndex > 0 ? 'mt-2' : ''}>{line}</p>;
      }
      // Empty line
      return <br key={lineIndex} />;
    });
  };
 
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
         
          {/* Messages - styled with support for multi-line and step-by-step content */}
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
                  {/* Render message content with formatting */}
                  {renderMessageContent(message.text)}
                  
                  {/* Render confirmation buttons if required */}
                  {message.requiresConfirmation && (
                    <div className="mt-4 flex justify-center space-x-2">
                      <button
                        onClick={() => handleConfirmation(true)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => handleConfirmation(false)}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                      >
                        No
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* Remediation progress indicator */}
            {isRemediation && (
              <div className="text-left mb-4">
                <div className="inline-block p-3 rounded-lg bg-white text-gray-800 rounded-bl-none shadow-md border border-gray-200">
                  <div className="flex items-center">
                    <div className="animate-spin mr-3 h-5 w-5 text-blue-600">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                    <span>Performing remediation steps...</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Typing indicator */}
            {isTyping && !isRemediation && (
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
              disabled={awaitingConfirmation || isRemediation}
              className="flex-1 px-4 py-3 text-base border border-gray-300 rounded-l-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={awaitingConfirmation || isRemediation}
              className={`${
                awaitingConfirmation || isRemediation ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
              } text-white px-5 py-3 rounded-r-xl focus:outline-none transition-colors duration-300 flex items-center justify-center`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
         
          {/* Quick action buttons - hidden when awaiting confirmation */}
          {!awaitingConfirmation && !isRemediation && (
            <div className="bg-gray-50 px-3 py-2 flex space-x-2 overflow-x-auto">
              <button
                onClick={() => {
                  setInputText("Show critical threats");
                  sendMessage();
                }}
                className="bg-white text-blue-600 border border-blue-200 px-3 py-1.5 rounded-full text-sm hover:bg-blue-50 whitespace-nowrap shadow-sm"
              >
                Critical threats
              </button>
              <button
                onClick={() => {
                  setInputText("Recent incidents");
                  sendMessage();
                }}
                className="bg-white text-blue-600 border border-blue-200 px-3 py-1.5 rounded-full text-sm hover:bg-blue-50 whitespace-nowrap shadow-sm"
              >
                Recent incidents
              </button>
              <button
                onClick={() => {
                  setInputText("Security group issues");
                  sendMessage();
                }}
                className="bg-white text-blue-600 border border-blue-200 px-3 py-1.5 rounded-full text-sm hover:bg-blue-50 whitespace-nowrap shadow-sm"
              >
                SG issues
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
 
export default Chatbot;