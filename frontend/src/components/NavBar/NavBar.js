import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { useAuth } from "../hooks/auth-hook";
import { Layout, Menu, Dropdown, Modal, message } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMicrophone,
  faArrowRightFromBracket,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import "./NavBar.css";
import { useHttpClient } from "../hooks/http-hook";
import LoadingSpinner from "../UIElements/LoadingSpinner";

const { Header } = Layout;
const { confirm } = Modal;

function NavBar() {
  const location = useLocation();
  const { token, logout } = useAuth();
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [profileImage, setProfileImage] = useState("");

  useEffect(() => {
    async function fetchUser() {
      const resData = await sendRequest(
        "http://localhost:5000/api/users/profile",
        "GET",
        null,
        {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      );
      setProfileImage(resData.user.image);
    }

    if (token) {
      fetchUser();
    }
  }, [token, sendRequest]);

  // Function to show confirmation modal
  const showLogoutConfirm = () => {
    confirm({
      title: "Are you sure you want to logout?",
      onOk() {
        logout();
      },
      onCancel() {
        message.success("Logout Canceled");
      },
    });
  };

  // Dropdown menu for profile and logout
  const menu = (
    <Menu>
      <Menu.Item key="profile">
        <Link to="/profile">
          <FontAwesomeIcon
            className="nav-icons"
            icon={faUser}
            style={{ color: "#141415" }}
          />
          Profile
        </Link>
      </Menu.Item>
      <Menu.Item key="logout" onClick={showLogoutConfirm}>
        <Link to="#">
          <FontAwesomeIcon
            className="nav-icons"
            icon={faArrowRightFromBracket}
            style={{ color: "#050505" }}
          />
          Logout
        </Link>
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout>
      {isLoading && <LoadingSpinner asOverlay />}
      {error && (
        <Modal title="An Error Occurred" visible={!!error} onOk={clearError}>
          <p>{error}</p>
        </Modal>
      )}
      <Header className="header">
        <div className="logo-container">
          <h3>Open Mic</h3>
          <FontAwesomeIcon
            icon={faMicrophone}
            style={{ color: "#000000", fontSize: "1.3rem" }}
          />
        </div>
        <Menu
          theme="light"
          mode="horizontal"
          selectedKeys={[location.pathname]}
          style={{ fontSize: "1rem" }}
          className="navbar"
        >
          <Menu.Item key="/" className="nav-links">
            <Link to="/">Home</Link>
          </Menu.Item>
          <Menu.Item key="/about" className="nav-links">
            <Link to="/about">About Us</Link>
          </Menu.Item>
          <Menu.Item key="/chats" className="nav-links">
            <Link to="/chats">Chats</Link>
          </Menu.Item>
          {token && (
            <Menu.Item key="/add-friend" className="nav-links">
              <Link to="/add-friend">Notification</Link>
            </Menu.Item>
          )}
          {token && (
            <Menu.Item key="profile-logout">
              <Dropdown
                overlay={menu}
                trigger={["click"]}
                className="nav-links"
              >
                <img
                  className="ant-dropdown-link"
                  src={`${profileImage}`}
                  onClick={(e) => e.preventDefault()}
                  alt="logo"
                />
              </Dropdown>
            </Menu.Item>
          )}
          {!token && (
            <Menu.Item key="/login" className="auth-links">
              <Link to="/login">Login</Link>
            </Menu.Item>
          )}
        </Menu>
      </Header>
    </Layout>
  );
}

export default NavBar;
