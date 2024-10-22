import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form, Input, Typography, Button, message, Upload, Modal } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { AuthContext } from "../context/auth-context";
import { useHttpClient } from "../hooks/http-hook";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import "./Auth.css";
import LoadingSpinner from "../UIElements/LoadingSpinner";
const { Text } = Typography;

const clientId =
  "921969604202-sonn0rg3g1svnt21rvistbaj5s6djnfr.apps.googleusercontent.com";

const Auth = () => {
  const navigate = useNavigate();
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const auth = useContext(AuthContext);
  const [isSignup, setIsSignup] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [form] = Form.useForm();

  const handleImageInput = (info) => {
    if (info.fileList.length > 0) {
      const file = info.file;
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageFile(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (values) => {
    let responseData;

    try {
      if (isSignup) {
        responseData = await sendRequest(
          "http://localhost:5000/api/users/signup",
          "POST",
          JSON.stringify({
            ...values,
            image: imageFile,
          }),
          {
            "Content-Type": "application/json",
          }
        );
        message.success("Sign Up Succesfull! Refresh Once.");
        auth.login(responseData.role, responseData.token);
        navigate("/chats");
      } else {
        responseData = await sendRequest(
          "http://localhost:5000/api/users/login",
          "POST",
          JSON.stringify(values),
          {
            "Content-Type": "application/json",
          }
        );
        message.success("Logged In Successfully! Refresh Once.");
        auth.login(responseData.role, responseData.token);
        setTimeout(() => {
          navigate("/chats");
        }, 5000);
      }
    } catch (err) {
      message.error(err.message || "Something went wrong!");
    }
  };

  const handleLoginSuccess = async (response) => {
    try {
      const { credential } = response;
      const res = await sendRequest(
        "http://localhost:5000/api/users/auth/google/callback",
        "POST",
        JSON.stringify({ token: credential }),
        {
          "Content-Type": "application/json",
        }
      );
      message.success("Google Authentication Complete!");
      auth.login(res.role, res.token);
      navigate("/chats");
    } catch (error) {
      console.error("Error:", error);
      message.error(error || "Something went wrong!");
    }
  };

  // const loginWithGoogle = () => {
  //   window.open("http://localhost:5000/auth/google/callback", "_self");
  // };

  const handleLoginFailure = (error) => {
    console.error("Login Failed:", error);
    message.error(error || "Something went wrong!");
  };
  const switchForm = () => {
    setIsSignup(!isSignup);
  };

  return (
    <React.Fragment>
      {isLoading && <LoadingSpinner asOverlay />}
      {error && (
        <Modal title="An Error Occurred" visible={!!error} onOk={clearError}>
          <p>{error}</p>
        </Modal>
      )}
      <div className="login-signup-container">
        <GoogleOAuthProvider clientId={clientId}>
          <div>
            <h3>{isSignup ? `Sign in` : `Login`} with Google</h3>
            {/* <Button onClick={loginWithGoogle}>Sign in with Google</Button> */}
            <GoogleLogin
              onSuccess={handleLoginSuccess}
              onError={handleLoginFailure}
            />
          </div>
        </GoogleOAuthProvider>
        <h2>{isSignup ? "Signup" : "Login"}</h2>
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          className="auth-form"
        >
          {isSignup && (
            <Form.Item
              label="Name"
              name="name"
              rules={[{ required: true, message: "Please input your name!" }]}
            >
              <Input />
            </Form.Item>
          )}
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: "Please input your email!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
            style={{ fontSize: "1rem" }}
          >
            <Input.Password />
          </Form.Item>
          {!isSignup && (
            <Text>
              <Link to="/reset-password" style={{ fontSize: "0.7rem" }}>
                Forgot your password?
              </Link>
            </Text>
          )}
          {isSignup && (
            <Form.Item label="Image">
              <Upload beforeUpload={() => false} onChange={handleImageInput}>
                <Button icon={<UploadOutlined />}>Click to Upload</Button>
              </Upload>
            </Form.Item>
          )}
          <Form.Item>
            <Button
              style={{ fontSize: "1rem" }}
              type="primary"
              htmlType="submit"
              block
            >
              {isSignup ? "Sign Up" : "Login"}
            </Button>
          </Form.Item>
        </Form>
        <Text style={{ fontSize: "0.9rem" }}>
          {isSignup ? "Already have an account?" : "Don't have an account?"}
          <Button
            style={{ fontSize: "0.9rem" }}
            type="link"
            onClick={switchForm}
          >
            {isSignup ? "Login Now" : "Sign Up Now"}
          </Button>
        </Text>
      </div>
    </React.Fragment>
  );
};

export default Auth;
