import React, { useEffect, useState, useRef } from "react";
// import Picker from "emoji-picker-react";
import "./Chat.css";
// import "emoji-mart/css/emoji-mart.css";
import { useAuth } from "../hooks/auth-hook";
import { useHttpClient } from "../hooks/http-hook";
import LoadingSpinner from "../UIElements/LoadingSpinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faCheckDouble } from "@fortawesome/free-solid-svg-icons";
import { io } from "socket.io-client";
import { Input, Button, Modal, Upload, message } from "antd";
import { UploadOutlined, FileImageOutlined } from "@ant-design/icons";
const { TextArea } = Input;

const Chat = () => {
  const { token } = useAuth();
  // const [showPicker, setShowPicker] = useState(false);
  const [uid, SetUID] = useState("");
  // const [typingUsers, setTypingUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editedText, setEditedText] = useState("");
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [background, setBackground] = useState("");
  const [searchText, setSearchText] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [newFile, setNewFile] = useState(null);
  const [socket, setSocket] = useState(null);
  const fileInputRef = useRef(null);
  // const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const resData = await sendRequest(
        `http://localhost:5000/api/users/friends`,
        "GET",
        null,
        {
          Authorization: `Bearer ${token}`,
        }
      );
      setUsers(resData.friends);
      SetUID(resData.userId);
    };

    if (token) {
      fetchData();
    }
  }, [token, sendRequest]);

  useEffect(() => {
    if (token) {
      const newSocket = io("http://localhost:5000", {
        auth: {
          token: `Bearer ${token}`,
        },
      });

      newSocket.on("onlineUsers", (users) => {
        setOnlineUsers(users);
      });

      newSocket.on("connect", () => {
        if (selectedChat) {
          newSocket.emit("addNewUser", selectedChat._id);
        }
        newSocket.emit("addToOnline", uid);
      });

      newSocket.on("message", (message) => {
        setMessages((prevMessages) => [...prevMessages, message.message]);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [token, selectedChat, messages, uid]);

  // useEffect(() => {
  //   if (selectedChat && socket) {
  //     const handleTyping = (data) => {
  //       if (data.room === selectedChat._id) {
  //         setTypingUsers((prev) => [...new Set([...prev, data.user])]);
  //       }
  //     };

  //     const handleStopTyping = (data) => {
  //       if (data.room === selectedChat._id) {
  //         setTypingUsers((prev) => prev.filter((user) => user !== data.user));
  //       }
  //     };

  //     socket.on("typing", handleTyping);
  //     socket.on("stopTyping", handleStopTyping);

  //     return () => {
  //       if (socket) {
  //         socket.off("typing", handleTyping);
  //         socket.off("stopTyping", handleStopTyping);
  //       }
  //     };
  //   }
  // }, [selectedChat, socket]);

  // const handleTyping = (e) => {
  //   setNewMessage(e.target.value);

  //   if (!isTyping) {
  //     setIsTyping(true);
  //     socket.emit("typing", {
  //       room: socket.id,
  //       user: uid,
  //       name: selectedChat.name,
  //     });
  //   }

  //   if (e.target.value === "") {
  //     setIsTyping(false);
  //     socket.emit("stopTyping", {
  //       room: socket.id,
  //       user: uid,
  //       name: selectedChat.name,
  //     });
  //   }
  // };

  // useEffect(() => {
  //   const timeout = setTimeout(() => {
  //     if (isTyping) {
  //       setIsTyping(false);
  //       socket.emit("stopTyping", {
  //         room: socket.id,
  //         user: uid,
  //         name: selectedChat.name,
  //       });
  //     }
  //   }, 3000);

  //   return () => clearTimeout(timeout);
  // }, [isTyping, newMessage, selectedChat, socket, uid]);

  const renderFilePreview = (fileUrl, fileName) => {
    const fileExtension = fileName.split(".").pop().toLowerCase();

    if (fileExtension === "mp3") {
      return (
        <audio controls>
          <source src={fileUrl} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      );
    } else if (fileExtension === "mp4") {
      return (
        <video width="320" height="240" controls>
          <source src={fileUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      );
    } else if (fileExtension === "pdf") {
      return (
        <iframe src={fileUrl} width="250" height="400" title="PDF File">
          Your browser does not support PDFs. <a href={fileUrl}>Download PDF</a>
        </iframe>
      );
    } else if (fileExtension === "txt") {
      return (
        <iframe src={fileUrl} width="300" height="400" title="Text File">
          Your browser does not support text files.{" "}
          <a href={fileUrl}>Download Text File</a>
        </iframe>
      );
    } else {
      return <img src={fileUrl} alt={fileName} className="image-preview" />;
    }
  };

  const handleChatClick = async (chat) => {
    setSelectedChat(chat);

    if (socket) {
      socket.emit("addNewUser", chat._id);

      const resData = await sendRequest(
        `http://localhost:5000/api/messages/${chat._id}`,
        "GET",
        null,
        {
          Authorization: `Bearer ${token}`,
        }
      );
      setMessages(resData.chat.messages);
    }
  };

  // const onEmojiClick = (event, emojiObject) => {
  //   console.log(emojiObject);

  //   setNewMessage(newMessage + emojiObject.emoji);
  //   setShowPicker(false);
  //

  const handleEditClick = (message) => {
    setEditingMessage(message);
    setEditedText(message.message);
  };

  const handleEditChange = (event) => {
    setEditedText(event.target.value);
  };

  const handleSearchChange = (event) => {
    setSearchText(event.target.value);
  };

  const handleFileInputChange = (event) => {
    setNewFile(event.target.files[0]);
  };

  const handleFileInputClick = () => {
    fileInputRef.current.click();
  };

  const handleEditSave = async (messageId) => {
    try {
      await sendRequest(
        `http://localhost:5000/api/messages/edit/${selectedChat._id}`,
        "POST",
        JSON.stringify({ editedText, messageId }),
        {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      );
    } catch (error) {}

    setEditingMessage(null);
  };

  const handleEditCancel = () => {
    setEditingMessage(null);
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() === "") {
      return;
    }
    const formData = new FormData();
    formData.append("message", newMessage);

    const resData = await sendRequest(
      `http://localhost:5000/api/messages/send-message/${selectedChat._id}`,
      "POST",
      JSON.stringify({ newMessage }),
      {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      }
    );
    setMessages([...messages, resData.messages[resData.messages.length - 1]]);
    // setIsTyping(false);
    // socket.emit("stopTyping", {
    //   room: selectedChat._id,
    //   user: uid,
    // });
    if (socket) {
      socket.emit("sendMessage", {
        chatId: selectedChat._id,
        newMessage: resData.messages[resData.messages.length - 1],
      });
    }
    setNewMessage("");
    setNewFile(null);
  };

  const uploadHandler = async () => {
    if (!newFile) {
      return;
    }

    const formD = new FormData();
    formD.append("filename", newFile);

    const resData = await sendRequest(
      `http://localhost:5000/api/messages/upload/${selectedChat._id}`,
      "POST",
      formD,
      {
        Authorization: `Bearer ${token}`,
      }
    );
    const newMessage = {
      fileUrl: resData.downloadURL,
      fileName: resData.name,
      senderId: resData.senderId,
      timestamp: new Date().toISOString(),
    };

    setMessages([...messages, newMessage]);
    if (socket) {
      socket.emit("sendMessage", {
        chatId: selectedChat._id,
        newMessage,
      });
    }
    setNewFile(null);
  };

  const filteredChats = users.filter((chat) =>
    chat.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <React.Fragment>
      <div className="chat-app">
        {isLoading && <LoadingSpinner asOverlay />}
        {error && (
          <Modal title="An Error Occurred" visible={!!error} onOk={clearError}>
            <p>{error}</p>
          </Modal>
        )}
        <div className="chat-list">
          <h2>Contacts</h2>
          <input
            type="text"
            className="search"
            placeholder="Search Contacts"
            value={searchText}
            onChange={handleSearchChange}
          />
          <ul>
            {filteredChats.map((user) => (
              <li
                key={user._id}
                className={
                  selectedChat && selectedChat._id === user._id ? "active" : ""
                }
                onClick={() => handleChatClick(user)}
              >
                <img src={user.image} alt="user dp" />
                <div>
                  <p>{user.name}</p>
                  <p>{user.bio}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div
          className="chat-container"
          style={{ backgroundImage: `url(${background})` }}
        >
          {selectedChat && (
            <div className="chat-container_header">
              <h2>{selectedChat.name}</h2>
              <div className="status-text">
                {onlineUsers.includes(selectedChat._id) ? (
                  <>
                    <span className="status-indicator online-indicator"></span>
                    <span className="online-status">Online</span>
                  </>
                ) : (
                  <>
                    <span className="status-indicator offline-indicator"></span>
                    <span className="offline-status">Offline</span>
                  </>
                )}
              </div>

              <div className="background-settings">
                <Upload
                  beforeUpload={() => false}
                  onChange={(info) => {
                    if (info.fileList.length > 0) {
                      const file = info.file;
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setBackground(reader.result);
                      };
                      reader.readAsDataURL(file);
                    } else if (info.file.status === "error") {
                      message.error("Upload failed");
                    }
                  }}
                >
                  <Button icon={<UploadOutlined />}>Upload</Button>
                </Upload>
              </div>
            </div>
          )}
          <hr />
          <div className="chat-history">
            {selectedChat ? (
              messages && messages.length >= 1 ? (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={`chat-message ${
                      message.senderId === selectedChat._id
                        ? "received"
                        : "sent"
                    }`}
                  >
                    {editingMessage && editingMessage._id === message._id ? (
                      <div>
                        <input
                          type="text"
                          value={editedText}
                          onChange={handleEditChange}
                          className="edit-input"
                        />
                        <button
                          onClick={() => handleEditSave(message._id)}
                          className="edit-save"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleEditCancel}
                          className="edit-cancel"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div>
                        {message.message}
                        {message.fileUrl && (
                          <a
                            href={message.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {renderFilePreview(
                              message.fileUrl,
                              message.fileName
                            )}
                          </a>
                        )}
                        <span className="timestamp">
                          {message.status === "edited" && <span>Edited </span>}
                          {new Date(message.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          <FontAwesomeIcon
                            icon={faCheckDouble}
                            style={{ color: "#666666" }}
                          />
                        </span>
                        {message.fileUrl === null &&
                          message.senderId === uid &&
                          message.status !== "edited" && (
                            <button
                              className="edit-icon"
                              onClick={() => handleEditClick(message)}
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </button>
                          )}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p>No messages</p>
              )
            ) : (
              <p>Select a chat to view messages</p>
            )}
          </div>
          {selectedChat && (
            <React.Fragment>
              {/* <div>
                {showPicker && <Picker onEmojiClick={onEmojiClick} />}
                <button
                  onClick={() => setShowPicker(!showPicker)}
                  className="emoji-button"
                >
                  😀
                </button>
              </div> */}
              <div className="chat-input">
                <TextArea
                  rows={1}
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                  }}
                />
                <Button
                  icon={<UploadOutlined />}
                  onClick={uploadHandler}
                  style={{ width: "40%" }}
                  disabled={!newFile}
                >
                  Upload
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileInputChange}
                  style={{ display: "none" }}
                />
                <Button
                  icon={<FileImageOutlined />}
                  style={{ width: "40%", margin: "0.5rem" }}
                  onClick={handleFileInputClick}
                />
                <Button
                  type="primary"
                  style={{ width: "40%" }}
                  onClick={handleSendMessage}
                >
                  Send
                </Button>
              </div>
            </React.Fragment>
          )}
        </div>
      </div>
    </React.Fragment>
  );
};

export default Chat;
