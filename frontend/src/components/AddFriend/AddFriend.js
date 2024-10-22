// AddFriend.jsx
import "./AddFriend.css";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/auth-hook";
import { useHttpClient } from "../hooks/http-hook";
import { Input, Button, List, Avatar, Modal, message } from "antd";
import { SearchOutlined, UserAddOutlined } from "@ant-design/icons";
import LoadingSpinner from "../UIElements/LoadingSpinner";

const AddFriend = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const sent = await sendRequest(
          `http://localhost:5000/api/friends/get-sent`,
          "GET",
          null,
          {
            Authorization: `Bearer ${token}`,
          }
        );
        setSentRequests(sent.requests);

        const received = await sendRequest(
          `http://localhost:5000/api/friends/get-received`,
          "GET",
          null,
          {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          }
        );
        setReceivedRequests(received.requests);
      } catch (err) {
        message.error("Failed to fetch friend requests.");
      }
    };
    if (token) {
      fetchRequests();
    }
  }, [token, sendRequest]);

  const handleSearchChange = (event) => {
    setSearchText(event.target.value);
  };

  const handleSearch = async () => {
    try {
      const resData = await sendRequest(
        `http://localhost:5000/api/users/search-user`,
        "POST",
        JSON.stringify({ query: searchText }),
        {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      );
      setSearchResults(resData.users);
    } catch (err) {
      message.error("Search failed. Please try again.");
    }
  };

  const handleSendRequest = async (friendId) => {
    try {
      await sendRequest(
        `http://localhost:5000/api/friends/sent`,
        "POST",
        JSON.stringify({ friendId }),
        {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      );
      message.success("Friend request sent successfully!");
    } catch (err) {
      message.error("Failed to send friend request.");
    }
  };

  const handleRequestResponse = async (requestId, action) => {
    try {
      await sendRequest(
        `http://localhost:5000/api/friends/action/${requestId}`,
        "POST",
        JSON.stringify({ action }),
        {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      );
      message.success(`Friend request ${action} successfully!`);
      setTimeout(() => {
        navigate("/chats");
      }, 3000);
    } catch (err) {
      message.error(`Failed to ${action} friend request.`);
    }
  };

  return (
    <React.Fragment>
      {isLoading && <LoadingSpinner asOverlay />}
      {error && (
        <Modal
          title="An Error Occurred"
          visible={!!error}
          onOk={clearError}
          onCancel={clearError}
        >
          <p>{error}</p>
        </Modal>
      )}
      <div className="friend-container">
        <div className="friend-requests">
          <div className="receive-request">
            <h3>Received Friend Requests</h3>
            <List
              dataSource={receivedRequests}
              renderItem={(request) => (
                <List.Item
                  actions={[
                    <Button
                      key="accept"
                      type="primary"
                      onClick={() =>
                        handleRequestResponse(request._id, "accepted")
                      }
                    >
                      Accept
                    </Button>,
                    <Button
                      key="reject"
                      danger
                      onClick={() =>
                        handleRequestResponse(request._id, "rejected")
                      }
                    >
                      Reject
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar>{request.fromName.charAt(0)}</Avatar>}
                    title={request.fromName}
                  />
                </List.Item>
              )}
            />
          </div>
          <div className="sent-request">
            <h3>Sent Friend Requests</h3>
            <List
              dataSource={sentRequests}
              renderItem={(request) => (
                <List.Item>
                  <List.Item.Meta
                    title={request.toName}
                    description={request.status}
                  />
                </List.Item>
              )}
            />
          </div>
        </div>
        <div className="add-friend">
          <h2>Search and Add Friends</h2>
          <Input
            placeholder="Find your friends using their name or email Id"
            value={searchText}
            onChange={handleSearchChange}
            suffix={<SearchOutlined onClick={handleSearch} />}
          />
          <div className="search-result">
            <List
              dataSource={searchResults}
              renderItem={(user) => (
                <List.Item
                  actions={[
                    <Button
                      key="add"
                      type="primary"
                      icon={<UserAddOutlined />}
                      onClick={() => handleSendRequest(user._id)}
                    >
                      Send Friend Request
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar src={user.image} />}
                    title={user.name}
                    description={user.email}
                  />
                </List.Item>
              )}
            />
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default AddFriend;
