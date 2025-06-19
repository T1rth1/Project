"use client"

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"

const Chatbot = forwardRef(({ isOpen, showWelcomePopup, onToggle, onOpen, onClose, onHideWelcomePopup }, ref) => {
  const [messages, setMessages] = useState([
    {
      text: "Hello! I'm your AWS Incident Assistant. How can I help you with your security monitoring today?",
      sender: "bot",
    },
  ])
  const [inputText, setInputText] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false)
  const [pendingSOP, setPendingSOP] = useState(null)
  const [isRemediation, setIsRemediation] = useState(false)
  const messagesEndRef = useRef(null)

  // Hide welcome popup after 10 seconds automatically
  useEffect(() => {
    const timer = setTimeout(() => {
      onHideWelcomePopup()
    }, 10000) // Hide after 10 seconds

    return () => clearTimeout(timer)
  }, [onHideWelcomePopup])

  // Expose methods to parent components
  useImperativeHandle(ref, () => ({
    openWithTicketInfo: (ticketInfo) => {
      // Format ticket information for chatbot - simplified version
      const formattedMessage = ticketInfo.description || "Please help me with this ticket."

      // Set the input text and open chatbot
      setInputText(formattedMessage)
      onOpen()

      // Focus on input after a short delay to ensure modal is open
      setTimeout(() => {
        const inputElement = document.querySelector(".chatbot-input")
        if (inputElement) {
          inputElement.focus()
        }
      }, 100)
    },
    openChatbot: () => {
      onOpen()
    },
    closeChatbot: () => {
      onClose()
    },
    hideWelcomePopup: () => {
      onHideWelcomePopup()
    },
  }))

  const handleInputChange = (e) => {
    setInputText(e.target.value)
  }

  // Format SOP steps with proper styling
  const formatSOPMessage = (responseData) => {
    if (!responseData) return "No response data available"

    let formattedMessage = ""

    // Add automatic SOP steps if available
    if (responseData.sop_steps && responseData.sop_steps.length > 0 && responseData.is_remediation === true) {
      formattedMessage += "## Automatic SOP Steps\n"
      formattedMessage += "These steps will be performed automatically if you choose to proceed:\n\n"
      responseData.sop_steps.forEach((step, index) => {
        formattedMessage += `${index + 1}. ${step}\n`
      })
      formattedMessage += "\n"
    }

    // Add critical SOP steps if available
    if (responseData.critical_sop_steps && responseData.critical_sop_steps.length > 0) {
      formattedMessage += "## Critical Manual Steps\n"
      formattedMessage += "These steps require manual intervention:\n\n"
      responseData.critical_sop_steps.forEach((step, index) => {
        formattedMessage += `${index + 1}. ${step}\n`
      })
      formattedMessage += "\n"
    }

    // Add parameters if available
    if (responseData.parameters && Object.keys(responseData.parameters).length > 0) {
      formattedMessage += "## Parameters\n"
      for (const [key, value] of Object.entries(responseData.parameters)) {
        formattedMessage += `- **${key}**: ${value}\n`
      }
      formattedMessage += "\n"
    }

    return formattedMessage
  }

  // Handle SOP confirmation responses
  const handleConfirmation = async (confirmed) => {
    if (!pendingSOP) return

    if (confirmed) {
      // Add a message showing that remediation is in progress
      setMessages((prevMessages) => [...prevMessages, { text: "Initiating remediation process...", sender: "bot" }])
      setIsRemediation(true)
      setIsTyping(true)

      try {
        // Call the remediation lambda function
        const remediationResult = await executeRemediation(pendingSOP)

        // Add the remediation result to chat
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: `Remediation complete: ${remediationResult}`, sender: "bot" },
        ])
      } catch (error) {
        // Handle errors in remediation
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            text: "There was an error executing the remediation steps. Please try again or contact support.",
            sender: "bot",
          },
        ])
      } finally {
        setIsTyping(false)
        setAwaitingConfirmation(false)
        setPendingSOP(null)
        setIsRemediation(false)
      }
    } else {
      // User declined to perform remediation
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: "Remediation cancelled. Please let me know if you need any other assistance.", sender: "bot" },
      ])
      setAwaitingConfirmation(false)
      setPendingSOP(null)
    }
  }

  const sendMessage = async (e) => {
    e?.preventDefault()
    if (inputText.trim() === "") return

    // Add user message
    const userMessage = { text: inputText, sender: "user" }
    setMessages([...messages, userMessage])
    const currentInput = inputText
    setInputText("")

    setIsTyping(true)

    try {
      // Make actual API call to your backend
      const response = await fetchResponseFromBackend(currentInput)

      // Handle SOP-related responses
      if (response && typeof response === "object") {
        // Check if any SOP steps are available (either regular or critical)
        const hasSopSteps =
          (response.sop_steps && response.sop_steps.length > 0) ||
          (response.critical_sop_steps && response.critical_sop_steps.length > 0)

        if (hasSopSteps) {
          // Store the response for later execution
          setPendingSOP(response)

          // Format the SOP steps as a structured message
          const formattedSOP = formatSOPMessage(response)

          // Only add SOP formatted message if there are actual steps to show
          if (formattedSOP.trim() !== "") {
            const botResponse = {
              text: formattedSOP,
              sender: "bot",
            }
            setMessages((prevMessages) => [...prevMessages, botResponse])
          }

          // Check for follow-up questions specifically asking for confirmation
          const hasConfirmationQuestion =
            response.follow_up_questions &&
            response.follow_up_questions.some(
              (q) =>
                q.toLowerCase().includes("would you like me to perform these step") ||
                q.toLowerCase().includes("perform these steps") ||
                q.toLowerCase().includes("perform this step"),
            )

          if (hasConfirmationQuestion && response.is_remediation === true) {
            // Display the confirmation prompt separately with buttons
            const confirmationPrompt = {
              text: "Would you like me to perform these steps?",
              sender: "bot",
              requiresConfirmation: true,
            }
            setMessages((prevMessages) => [...prevMessages, confirmationPrompt])
            setAwaitingConfirmation(true)
          } else {
            // Display other follow-up questions as regular messages
            if (response.follow_up_questions && response.follow_up_questions.length > 0) {
              const followUpText = response.follow_up_questions.join("\n")
              const followUpResponse = {
                text: followUpText,
                sender: "bot",
              }
              setMessages((prevMessages) => [...prevMessages, followUpResponse])
            }
          }
        } else {
          // Regular response with no SOP steps
          handleRegularResponse(response)
        }
      } else if (response && typeof response === "string") {
        // Regular string response
        const botResponse = {
          text: response,
          sender: "bot",
        }
        setMessages((prevMessages) => [...prevMessages, botResponse])
      } else {
        // Handle empty or null response
        const botResponse = {
          text: "I didn't get a proper response from the security service. Please try again.",
          sender: "bot",
        }
        setMessages((prevMessages) => [...prevMessages, botResponse])
      }
    } catch (error) {
      // Handle error with a friendly message
      const errorResponse = {
        text: "I'm having trouble connecting to the security service. Please try again later.",
        sender: "bot",
      }
      setMessages((prevMessages) => [...prevMessages, errorResponse])
    } finally {
      setIsTyping(false)
    }
  }

  // Handle regular (non-SOP) responses
  const handleRegularResponse = (response) => {
    // Check if it has follow-up questions
    if (response.follow_up_questions && response.follow_up_questions.length > 0) {
      // If there's a response content, show it first
      if (response.response && (response.response.text || response.response.code)) {
        const responseContent = {
          text: JSON.stringify(response),
          sender: "bot",
        }
        setMessages((prevMessages) => [...prevMessages, responseContent])
      }

      // Then show follow-up questions
      const followUpText = response.follow_up_questions.join("\n")
      const followUpResponse = {
        text: followUpText,
        sender: "bot",
      }
      setMessages((prevMessages) => [...prevMessages, followUpResponse])
    } else {
      // Handle regular response with no follow-up questions
      // Use the response content directly instead of summary
      const botResponse = {
        text: JSON.stringify(response),
        sender: "bot",
      }
      setMessages((prevMessages) => [...prevMessages, botResponse])
    }
  }

  // Function to execute remediation steps
  const executeRemediation = async (sopData) => {
    const userId = sessionStorage.getItem("id")

    try {
      // Call the remediation lambda directly using its functional URL
      const response = await fetch(process.env.REACT_APP_LAMBDA_REMEDIATOR, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sopSteps: sopData.sop_steps, parameters: sopData.parameters, userId: userId }),
      })
      if (!response.ok) {
        throw new Error("Remediation process failed")
      }

      const data = await response.json();
      const successMessage = data.results?.length ? Object.values(data.results[0])[0] : null;

      return successMessage || "Remediation completed successfully";
    } catch (error) {
      console.error("Error executing remediation:", error)
      throw error
    }
  }

  // Function to fetch response from backend
  const fetchResponseFromBackend = async (query) => {
    try {
      // Get previous summary from local storage if available
      let previousSummary = ""
      const storedData = localStorage.getItem("chatbotData")

      if (storedData) {
        const parsedData = JSON.parse(storedData)
        if (parsedData.summary) {
          previousSummary = parsedData.summary
        }
      }

      // Make the API call to your AWS Lambda endpoint with query and previous summary
      const response = await fetch(process.env.REACT_APP_LAMBDA_MEDIATOR, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: query,
          summary: previousSummary,
        }),
      })

      if (!response.ok) {
        throw new Error("Network response was not ok")
      }

      const data = await response.json()
      console.log("response from the chatbot", data)

      // Store the response data in local storage
      localStorage.setItem("chatbotData", JSON.stringify(data))

      return data
    } catch (error) {
      console.error("Error fetching from backend:", error)
      throw error
    }
  }

  // Auto scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const clearChatHistory = () => {
    // Clear localStorage
    localStorage.removeItem("chatbotData")

    // Reset messages to initial state
    setMessages([
      {
        text: "Hello! I'm your AWS Incident Assistant. How can I help you with your security monitoring today?",
        sender: "bot",
      },
    ])

    // Reset other states
    setAwaitingConfirmation(false)
    setPendingSOP(null)
    setIsRemediation(false)

    // Optional: Show confirmation message
    setTimeout(() => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: "Chat history and stored data have been cleared successfully! 🗑️", sender: "bot" },
      ])
    }, 500)
  }

  const renderMessageContent = (text) => {
    if (!text) return null

    // Check if the text is a JSON string (from backend response)
    try {
      const jsonData = JSON.parse(text)

      // Handle the specific response format with text and code arrays in response object
      if (jsonData.response && (jsonData.response.text || jsonData.response.code)) {
        return (
          <div className="message-content">
            {/* Render text content */}
            {jsonData.response.text &&
              jsonData.response.text.map((item, index) => (
                <p key={`text-${index}`} className={index > 0 ? "mt-3" : ""}>
                  {processTextWithFormatting(item)}
                </p>
              ))}

            {/* Render code blocks */}
            {jsonData.response.code &&
              jsonData.response.code.map((codeBlock, index) => {
                // Extract code content from markdown format if needed
                let codeContent = codeBlock.content
                let language = codeBlock.language || "text"

                // If code content contains markdown code block markers, extract the actual code
                if (codeContent.startsWith("```") && codeContent.includes("\n")) {
                  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/
                  const match = codeContent.match(codeBlockRegex)

                  if (match) {
                    language = match[1] || language
                    codeContent = match[2]
                  }
                }

                return (
                  <div key={`code-${index}`} className="my-3 rounded-md overflow-hidden">
                    <div className="px-4 py-2 bg-gray-700 text-xs text-gray-300 flex justify-between">
                      <span>{language}</span>
                      <button
                        onClick={() => navigator.clipboard.writeText(codeContent)}
                        className="text-gray-300 hover:text-white transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                    <SyntaxHighlighter
                      language={language}
                      style={vscDarkPlus}
                      customStyle={{
                        margin: 0,
                        padding: "1rem",
                        maxHeight: "400px",
                        maxWidth: "250px",
                        msOverflowStyle: "none" /* IE and Edge */,
                        scrollbarWidth: "none",
                        whiteSpace: "pre",
                      }}
                    >
                      {codeContent}
                    </SyntaxHighlighter>
                  </div>
                )
              })}
          </div>
        )
      }
    } catch (e) {
      // Not a JSON string, continue with normal rendering
    }

    // Split the text into lines to handle different parts
    const lines = text.split("\n")

    // Check if the text contains code blocks
    if (text.includes("```")) {
      const segments = []
      let inCodeBlock = false
      let currentSegment = ""
      let language = ""

      lines.forEach((line, i) => {
        if (line.startsWith("```") && !inCodeBlock) {
          // Start of code block
          if (currentSegment) {
            segments.push({ type: "text", content: currentSegment })
            currentSegment = ""
          }
          inCodeBlock = true
          language = line.slice(3).trim()
        } else if (line.startsWith("```") && inCodeBlock) {
          // End of code block
          segments.push({ type: "code", content: currentSegment, language })
          currentSegment = ""
          inCodeBlock = false
        } else {
          currentSegment += (i > 0 && currentSegment ? "\n" : "") + line
        }
      })

      // Add any remaining segment
      if (currentSegment) {
        segments.push({
          type: inCodeBlock ? "code" : "text",
          content: currentSegment,
          language: inCodeBlock ? language : "",
        })
      }

      return (
        <div>
          {segments.map((segment, idx) => {
            if (segment.type === "code") {
              return (
                <div key={idx} className="my-3 rounded-md overflow-hidden">
                  {segment.language && (
                    <div className="px-4 py-2 bg-gray-700 text-xs text-gray-300 flex justify-between">
                      <span>{segment.language}</span>
                      <button
                        onClick={() => navigator.clipboard.writeText(segment.content)}
                        className="text-gray-300 hover:text-white transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                  )}
                  <SyntaxHighlighter
                    language={segment.language || "text"}
                    style={vscDarkPlus}
                    customStyle={{
                      margin: 0,
                      padding: "1rem",
                      maxHeight: "500px",
                      maxWidth: "250px",
                      whiteSpace: "pre",
                    }}
                  >
                    {segment.content}
                  </SyntaxHighlighter>
                </div>
              )
            } else {
              return renderTextContent(segment.content, idx)
            }
          })}
        </div>
      )
    }

    return renderTextContent(text)
  }

  // Helper function to process text with formatting (bold, emojis)
  const processTextWithFormatting = (text) => {
    if (!text || typeof text !== "string") return text

    // Check for bold text (**text**)
    if (text.includes("**")) {
      const parts = []
      let inBold = false
      let currentText = ""

      for (let i = 0; i < text.length; i++) {
        if (i < text.length - 1 && text.substr(i, 2) === "**") {
          parts.push({ text: currentText, bold: inBold })
          currentText = ""
          inBold = !inBold
          i++ // Skip the next character
        } else {
          currentText += text[i]
        }
      }

      if (currentText) {
        parts.push({ text: currentText, bold: inBold })
      }

      return (
        <>{parts.map((part, partIndex) => (part.bold ? <strong key={partIndex}>{part.text}</strong> : part.text))}</>
      )
    }

    // If no special formatting, return as is
    return text
  }

  // Helper function to render text content with formatting
  const renderTextContent = (text, key = 0) => {
    if (!text) return null

    // Split the text into lines to handle different parts
    const lines = text.split("\n")

    return (
      <div key={key}>
        {lines.map((line, lineIndex) => {
          // Handle headings
          if (line.startsWith("## ")) {
            return (
              <h2 key={lineIndex} className="font-bold text-lg mt-2 mb-1">
                {line.replace("## ", "")}
              </h2>
            )
          }
          // Handle list items with numbers
          else if (line.match(/^\d+\.\s/)) {
            return (
              <div key={lineIndex} className="ml-4 my-1">
                {line}
              </div>
            )
          }
          // Handle bullet points
          else if (line.startsWith("- ")) {
            const content = line.replace("- ", "")
            // Check for bold text within bullet points
            if (content.includes("**")) {
              const parts = content.split("**")
              if (parts.length >= 3) {
                return (
                  <div key={lineIndex} className="ml-4 my-1">
                    • <strong>{parts[1]}</strong>
                    {parts[2]}
                  </div>
                )
              }
            }
            return (
              <div key={lineIndex} className="ml-4 my-1">
                • {content}
              </div>
            )
          }
          // Handle emoji and highlighted text
          else if (line.trim() !== "") {
            // Process bold text and emojis
            const processedLine = line
            if (line.includes("**")) {
              const parts = []
              let inBold = false
              let currentText = ""

              for (let i = 0; i < line.length; i++) {
                if (i < line.length - 1 && line.substr(i, 2) === "**") {
                  parts.push({ text: currentText, bold: inBold })
                  currentText = ""
                  inBold = !inBold
                  i++ // Skip the next character
                } else {
                  currentText += line[i]
                }
              }

              if (currentText) {
                parts.push({ text: currentText, bold: inBold })
              }

              return (
                <p key={lineIndex} className={lineIndex > 0 ? "mt-2" : ""}>
                  {parts.map((part, partIndex) =>
                    part.bold ? <strong key={partIndex}>{part.text}</strong> : part.text,
                  )}
                </p>
              )
            }

            return (
              <p key={lineIndex} className={lineIndex > 0 ? "mt-2" : ""}>
                {processedLine}
              </p>
            )
          }
          // Empty line
          return <br key={lineIndex} />
        })}
      </div>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Welcome popup message - CONTROLLED BY PROPS */}
      {showWelcomePopup && (
        <div className="fixed bottom-20 right-6 z-40 max-w-sm bg-white rounded-lg shadow-lg border border-gray-200 py-4 px-3 mb-4 flex items-start">
          <div>
            <img
              src="https://www.shutterstock.com/image-vector/chat-bot-icon-virtual-smart-600nw-2478937553.jpg"
              className="h-16 w-16 text-white"
              alt="Chatbot"
            />
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900 mb-1">
              Automatically resolve your customer service queries with AI!
            </p>
            <p className="text-gray-600 text-sm mb-2">Start a chat to learn more</p>
            <div className="flex items-center">
              <span className="text-amber-500 text-xl mr-1">👇</span>
              <button onClick={onToggle} className="text-blue-600 font-medium hover:text-blue-800 transition-colors">
                Chat now
              </button>
            </div>
          </div>
          <button
            className="text-gray-400 hover:text-gray-600 ml-2"
            onClick={(e) => {
              e.stopPropagation()
              onHideWelcomePopup()
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Chatbot button - shows different icon based on PROPS open state */}
      <button
        onClick={onToggle}
        className={`${
          isOpen ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
        } text-white p-4 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 w-16 h-16`}
        title={isOpen ? "Close Chat" : "Open Chat"}
      >
        {isOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        )}
      </button>

      {/* Chatbot window - controlled by PROPS state */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-96 bg-white rounded-3xl shadow-4xl overflow-hidden border border-gray-200 transition-all duration-300">
          {/* Enhanced Header with AWS-inspired styling and better description */}
          <div className="bg-gradient-to-r from-blue-800 to-blue-600 text-white px-5 py-4 flex justify-between items-center">
            <div className="flex items-center">
              <img
                src="https://www.kenyt.ai/botapp/api/botsetup/getimage?imagetype=chatbubble-icon&botid=192626894"
                alt="CloudThat Logo"
                className="h-10 mr-3"
              />
              <div>
                <h3 className="font-medium text-lg">AWS Incident Assistant</h3>
                <span className="text-sm text-blue-100">Hey👋, </span>
                <span className="text-sm text-blue-100">Chat with our consultants now!</span>
              </div>
            </div>
            {/* Clear storage button */}
            <div className="flex items-center space-x-2">
              <button
                onClick={clearChatHistory}
                className="text-white hover:text-gray-200 focus:outline-none p-1 rounded-md hover:bg-white/10 transition-colors duration-200"
                title="Clear chat history and stored data"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onClose()
                }}
                className="text-white hover:text-gray-200 focus:outline-none p-1 rounded-md hover:bg-white/10 transition-colors duration-200"
                title="Close chatbot"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages - styled with support for multi-line and step-by-step content */}
          <div className="h-96 overflow-y-auto p-5 bg-gray-50">
            {messages.map((message, index) => (
              <div key={index} className={`mb-4 ${message.sender === "user" ? "text-right" : "text-left"}`}>
                <div className={`flex items-start ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                  {/* Bot icon */}
                  {message.sender === "bot" && (
                    <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white mr-2 flex-shrink-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9.504 1.132a1 1 0 01.992 0l1.75 1a1 1 0 11-.992 1.736L10 3.152l-1.254.716a1 1 0 11-.992-1.736l1.75-1zM5.618 4.504a1 1 0 01-.372 1.364L5.016 6l.23.132a1 1 0 11-.992 1.736L4 7.723V8a1 1 0 01-2 0V6a.996.996 0 01.52-.878l1.734-.99a1 1 0 011.364.372zm8.764 0a1 1 0 011.364-.372l1.733.99A1.002 1.002 0 0118 6v2a1 1 0 11-2 0v-.277l-.254.145a1 1 0 11-.992-1.736l.23-.132-.23-.132a1 1 0 01-.372-1.364zm-7 4a1 1 0 011.364-.372L10 8.848l1.254-.716a1 1 0 11.992 1.736L11 10.58V12a1 1 0 11-2 0v-1.42l-1.246-.712a1 1 0 01-.372-1.364zM3 11a1 1 0 011 1v1.42l1.246.712a1 1 0 11-.992 1.736l-1.75-1A1 1 0 012 14v-2a1 1 0 011-1zm14 0a1 1 0 011 1v2a1 1 0 01-.504.868l-1.75 1a1 1 0 11-.992-1.736L16 13.42V12a1 1 0 011-1zm-9.618 5.504a1 1 0 011.364-.372l.254.145V16a1 1 0 112 0v.277l.254-.145a1 1 0 11.992 1.736l-1.735.992a.995.995 0 01-1.022 0l-1.735-.992a1 1 0 01-.372-1.364z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}

                  <div className="max-w-xs lg:max-w-md">
                    <div
                      className={`inline-block p-3 rounded-lg ${
                        message.sender === "user"
                          ? "bg-blue-600 text-white rounded-br-none shadow-md"
                          : "bg-white text-gray-800 rounded-bl-none shadow-md border border-gray-200"
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

                    {/* Timestamp */}
                    <div
                      className={`text-xs text-gray-500 mt-1 ${message.sender === "user" ? "text-right" : "text-left"}`}
                    >
                      {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>

                  {/* User icon */}
                  {message.sender === "user" && (
                    <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 ml-2 flex-shrink-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Remediation progress indicator */}
            {isRemediation && (
              <div className="text-left mb-4">
                <div className="flex items-start">
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white mr-2 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M9.504 1.132a1 1 0 01.992 0l1.75 1a1 1 0 11-.992 1.736L10 3.152l-1.254.716a1 1 0 11-.992-1.736l1.75-1zM5.618 4.504a1 1 0 01-.372 1.364L5.016 6l.23.132a1 1 0 11-.992 1.736L4 7.723V8a1 1 0 01-2 0V6a.996.996 0 01.52-.878l1.734-.99a1 1 0 011.364.372zm8.764 0a1 1 0 011.364-.372l1.733.99A1.002 1.002 0 0118 6v2a1 1 0 11-2 0v-.277l-.254.145a1 1 0 11-.992-1.736l.23-.132-.23-.132a1 1 0 01-.372-1.364zm-7 4a1 1 0 011.364-.372L10 8.848l1.254-.716a1 1 0 11.992 1.736L11 10.58V12a1 1 0 11-2 0v-1.42l-1.246-.712a1 1 0 01-.372-1.364zM3 11a1 1 0 011 1v1.42l1.246.712a1 1 0 11-.992 1.736l-1.75-1A1 1 0 012 14v-2a1 1 0 011-1zm14 0a1 1 0 011 1v2a1 1 0 01-.504.868l-1.75 1a1 1 0 11-.992-1.736L16 13.42V12a1 1 0 011-1zm-9.618 5.504a1 1 0 011.364-.372l.254.145V16a1 1 0 112 0v.277l.254-.145a1 1 0 11.992 1.736l-1.735.992a.995.995 0 01-1.022 0l-1.735-.992a1 1 0 01-.372-1.364z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="inline-block p-3 rounded-lg bg-white text-gray-800 rounded-bl-none shadow-md border border-gray-200">
                    <div className="flex items-center">
                      <div className="animate-spin mr-3 h-5 w-5 text-blue-600">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      </div>
                      <span>Performing remediation steps...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Typing indicator */}
            {isTyping && !isRemediation && (
              <div className="text-left mb-4">
                <div className="flex items-start">
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white mr-2 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M9.504 1.132a1 1 0 01.992 0l1.75 1a1 1 0 11-.992 1.736L10 3.152l-1.254.716a1 1 0 11-.992-1.736l1.75-1zM5.618 4.504a1 1 0 01-.372 1.364L5.016 6l.23.132a1 1 0 11-.992 1.736L4 7.723V8a1 1 0 01-2 0V6a.996.996 0 01.52-.878l1.734-.99a1 1 0 011.364.372zm8.764 0a1 1 0 011.364-.372l1.733.99A1.002 1.002 0 0118 6v2a1 1 0 11-2 0v-.277l-.254.145a1 1 0 11-.992-1.736l.23-.132-.23-.132a1 1 0 01-.372-1.364zm-7 4a1 1 0 011.364-.372L10 8.848l1.254-.716a1 1 0 11.992 1.736L11 10.58V12a1 1 0 11-2 0v-1.42l-1.246-.712a1 1 0 01-.372-1.364zM3 11a1 1 0 011 1v1.42l1.246.712a1 1 0 11-.992 1.736l-1.75-1A1 1 0 012 14v-2a1 1 0 011-1zm14 0a1 1 0 011 1v2a1 1 0 01-.504.868l-1.75 1a1 1 0 11-.992-1.736L16 13.42V12a1 1 0 011-1zm-9.618 5.504a1 1 0 011.364-.372l.254.145V16a1 1 0 112 0v.277l.254-.145a1 1 0 11.992 1.736l-1.735.992a.995.995 0 01-1.022 0l-1.735-.992a1 1 0 01-.372-1.364z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="inline-block p-3 rounded-lg bg-white text-gray-800 rounded-bl-none shadow-md border border-gray-200">
                    <div className="flex space-x-2">
                      <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-bounce"></div>
                      <div
                        className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                      <div
                        className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-bounce"
                        style={{ animationDelay: "0.4s" }}
                      ></div>
                    </div>
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
              placeholder="Ask about AWS services, incidents, or code..."
              disabled={awaitingConfirmation || isRemediation}
              className="chatbot-input flex-1 px-4 py-3 text-base border border-gray-300 rounded-l-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={awaitingConfirmation || isRemediation}
              className={`${
                awaitingConfirmation || isRemediation ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
              } text-white px-5 py-3 rounded-r-xl focus:outline-none transition-colors duration-300 flex items-center justify-center`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </form>

          {/* Copyright footer */}
          <div className="bg-gray-50 text-center py-2 text-xs text-gray-500 border-t border-gray-200">
            © {new Date().getFullYear()} AWS Incident Assistant | All Rights Reserved
          </div>
        </div>
      )}
    </div>
  )
})

export default Chatbot
