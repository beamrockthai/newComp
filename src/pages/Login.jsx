import { Form, Input, Button, Checkbox, Row, Card, message } from "antd";
import axios from "axios";
import { useState } from "react";
import { authUser, PATH_API } from "../constrant";

export const LoginPage = () => {
  const [loadings, setLoadings] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const onSubmit = (value) => {
    setLoadings(true);
    const newData = {
      Email: value.Email,
      Password: value.Password,
    };
    axios
      .post(PATH_API + "/users/login", newData)
      .then((res) => {
        if (res.status === 200) {
          // console.log(res);
          localStorage.setItem("user", JSON.stringify(res.data));
          // console.log("AUTH : " + authUser);
          setLoadings(false);
          if (res.data.Role === 2) {
            window.location.assign("/admin");
            message.success(
              res.data.FirstName && res.data.LastName !== null
                ? `Welcome ${res.data.FirstName} ${res.data.LastName}`
                : "Welcome ",
              2
            );
            setLoadings(false);
          }
          if (res.data.Role === 3) {
            window.location.assign("/director");
            message.success(
              res.data.FirstName && res.data.LastName !== null
                ? `Welcome ${res.data.FirstName} ${res.data.LastName}`
                : "Welcome ",
              2
            );
            setLoadings(false);
          }
          if (res.data.Role === 4) {
            window.location.assign("/");
            message.success(
              res.data.FirstName && res.data.LastName !== null
                ? `Welcome ${res.data.FirstName} ${res.data.LastName}`
                : "Welcome ",
              2
            );
            setLoadings(false);
          }
        } else if (res.status === 204) {
          message.warning(
            "ไม่พบการลงทะเบียน หรือคุณไม่มีสิทธิ์ลงชื่อเข้าใช้",
            5
          );
          setLoadings(false);
        } else {
          /// call api error
          setLoadings(false);
          window.alert(res.data.message);
        }
      })
      .catch((err) => {
        setLoadings(false);
        if (err.response) {
          setLoadings(false);
          if (err.response.status === 401) {
            message.error("ข้อมูลลงชื่อเข้าใช้ไม่ถูกต้อง");
            setLoadings(false);
          }
          console.log(err.response.status);
        }
      });
  };
  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <div>
      <Row
        type="flex"
        justify="center"
        align="middle"
        style={{ minHeight: "100vh" }}
      >
        <Card title={<h3 style={{ color: "white" }}>Plese Login First</h3>}>
          <Form
            name="basic"
            labelCol={{
              span: 8,
            }}
            wrapperCol={{
              span: 16,
            }}
            style={{
              maxWidth: 600,
            }}
            initialValues={{
              remember: true,
            }}
            onFinish={onSubmit}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
          >
            <Form.Item
              label="Email"
              name="Email"
              rules={[
                {
                  required: true,
                  message: "Please input your Email!",
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Password"
              name="Password"
              rules={[
                {
                  required: true,
                  message: "Please input your Password!",
                },
              ]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item
              name="remember"
              valuePropName="checked"
              wrapperCol={{
                offset: 8,
                span: 16,
              }}
            >
              <Checkbox>Remember me</Checkbox>
            </Form.Item>
            <Form.Item
              wrapperCol={{
                offset: 8,
                span: 16,
              }}
            >
              <Button type="primary" loading={loadings} htmlType="submit">
                Submit
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Row>
    </div>
  );
};
