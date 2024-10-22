import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Typography, message, Modal } from "antd";
import { useHttpClient } from "../hooks/http-hook";
import "./ForgotPassword.css";
import LoadingSpinner from "../UIElements/LoadingSpinner";
const { Text } = Typography;

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [form] = Form.useForm();
  const [otpSent, setOtpSent] = useState(false);
  const [email, setEmail] = useState("");

  const handleSendOtp = async (values) => {
    try {
      await sendRequest(
        "http://localhost:5000/api/users/send-otp",
        "POST",
        JSON.stringify({
          email: values.email,
        }),
        {
          "Content-Type": "application/json",
        }
      );
      message.success("OTP sent to your email!");
      setEmail(values.email);
      setOtpSent(true);
    } catch (err) {
      message.error(err.message || "Failed to send OTP.");
    }
  };

  const handleResetPassword = async (values) => {
    try {
      await sendRequest(
        "http://localhost:5000/api/users/reset-password",
        "POST",
        JSON.stringify({
          email,
          otp: values.otp,
          newPassword: values.newPassword,
        }),
        {
          "Content-Type": "application/json",
        }
      );
      message.success("Password reset successfully!");
      navigate("/auth");
    } catch (err) {
      console.log(err);
      message.error(err || "Failed to reset password.");
    }
  };

  return (
    <div className="reset-password-container">
      {isLoading && <LoadingSpinner asOverlay />}
      {error && (
        <Modal title="An Error Occurred" visible={!!error} onOk={clearError}>
          <p>{error}</p>
        </Modal>
      )}
      <h2>Reset Password</h2>
      {!otpSent ? (
        <Form
          form={form}
          onFinish={handleSendOtp}
          layout="vertical"
          className="reset-form"
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: "Please input your email!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <Button
              style={{ fontSize: "1rem" }}
              type="primary"
              htmlType="submit"
              block
            >
              Send OTP
            </Button>
          </Form.Item>
        </Form>
      ) : (
        <Form
          form={form}
          onFinish={handleResetPassword}
          layout="vertical"
          className="reset-form"
        >
          <Form.Item
            label="OTP"
            name="otp"
            rules={[{ required: true, message: "Please input the OTP!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="New Password"
            name="newPassword"
            rules={[
              { required: true, message: "Please input your new password!" },
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            label="Confirm Password"
            name="confirmPassword"
            dependencies={["newPassword"]}
            hasFeedback
            rules={[
              { required: true, message: "Please confirm your new password!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("The two passwords do not match!")
                  );
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button
              style={{ fontSize: "1rem" }}
              type="primary"
              htmlType="submit"
              block
            >
              Reset Password
            </Button>
          </Form.Item>
        </Form>
      )}
      {error && <Text type="danger">{error}</Text>}
    </div>
  );
};

export default ForgotPassword;
