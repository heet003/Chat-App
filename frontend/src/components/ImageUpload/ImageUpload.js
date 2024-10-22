import React, { useRef, useState, useEffect, useContext } from "react";
import "./ImageUpload.css";
import { Button, ConfigProvider, Space } from "antd";
import { css } from "@emotion/css";

const ImageUpload = (props) => {
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const rootPrefixCls = getPrefixCls();
  const linearGradientButton = css`
    &.${rootPrefixCls}-btn-primary:not([disabled]):not(
        .${rootPrefixCls}-btn-dangerous
      ) {
      border-width: 0;
      > span {
        position: relative;
      }
      &::before {
        content: "";
        background: linear-gradient(135deg, #6253e1, #04befe);
        position: absolute;
        inset: 0;
        opacity: 1;
        transition: all 0.3s;
        border-radius: inherit;
      }
      &:hover::before {
        opacity: 0;
      }
    }
  `;
  const [file, setFile] = useState();
  const [previewUrl, setPreviewUrl] = useState("");
  const [isValid, setIsValid] = useState(false);
  const filePickerRef = useRef();

  useEffect(() => {
    if (!file) {
      return;
    }
    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewUrl(fileReader.result);
      setIsValid(true);
      props.onInput(props.id, fileReader.result, isValid);
    };
    fileReader.readAsDataURL(file);
  }, [file, props, isValid]);

  const pickedHandler = (event) => {
    let pickedFile;
    if (event.target.files && event.target.files.length === 1) {
      pickedFile = event.target.files[0];
      setFile(pickedFile);
      setIsValid(true);
    } else {
      setIsValid(false);
      props.onInput(props.id, null, false);
    }
  };

  const pickImageHandler = () => {
    filePickerRef.current.click();
  };

  return (
    <div className="form-control">
      <ConfigProvider
        button={{
          className: linearGradientButton,
        }}
      >
        <input
          id={props.id}
          ref={filePickerRef}
          style={{ display: "none" }}
          type="file"
          accept=".jpg,.png,.jpeg"
          onChange={pickedHandler}
        />
        <div className={`image-upload ${props.center && "center"}`}>
          <div className="image-upload__preview">
            <img
              src={
                previewUrl
                  ? previewUrl
                  : props.userImage
                  ? props.userImage
                  : `https://bootdey.com/img/Content/avatar/avatar7.png`
              }
              alt="Preview"
            />
          </div>
          <Space>
            <Button type="primary" size="large" onClick={pickImageHandler}>
              {props.btnText}
            </Button>
          </Space>
        </div>
      </ConfigProvider>
    </div>
  );
};

export default ImageUpload;
