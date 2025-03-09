// import React, { useEffect, useState } from "react";
// import {
//   Card,
//   Row,
//   Col,
//   Typography,
//   Button,
//   Popconfirm,
//   message,
//   Spin,
//   Modal,
//   Form,
//   Input,
//   DatePicker,
//   Select,
//   Table,
// } from "antd";
// import {
//   loadUsers,
//   deleteUser,
//   updateUser,
// } from "../../services/userFunctions";
// import { UserTable } from "../../components/UserTable";
// import moment from "moment";

// const { Title, Text } = Typography;

// export const UserManagement = () => {
//   const [form] = Form.useForm();
//   const [formEdit] = Form.useForm();
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [editModalVisible, setEditModalVisible] = useState(false);
//   const [editingUser, setEditingUser] = useState(null);

//   useEffect(() => {
//     loadUsers(setUsers, setLoading);
//   }, []);
//   const handleEditUser = (record) => {
//     setEditingUser(record);
//     formEdit.setFieldsValue(record);
//     setEditModalVisible(true);
//   };

//   const handleUpdateUser = async () => {
//     try {
//       const values = await formEdit.validateFields();
//       const updatedUsers = {
//         ...values,
//         startDate: values.startDate ? values.startDate.toDate() : null,
//         endDate: values.endDate ? values.endDate.toDate() : null,
//         status: values.status, // อัปเดตค่า status
//       };
//       await updateUser(editingUser.id, updatedUsers);
//       message.success("อัปเดตข้อมูลเรียบร้อยแล้ว");
//       setEditModalVisible(false);
//       setEditingUser(null);
//       loadUsers();
//     } catch (error) {
//       message.error("เกิดข้อผิดพลาดในการอัปเดตข้อมูล");
//     }
//   };
//   const handleDelete = async (id) => {
//     await deleteUser(id);
//     loadUsers();
//   };
//   const columns = UserTable({ handleEditUser, handleDelete });
//   return (
//     <div style={{ padding: "20px" }}>
//       {JSON.stringify(users)}
//       <Title
//         level={2}
//         style={{
//           marginBottom: "20px",
//           color: "#1890ff",
//           fontWeight: "bold",
//           textAlign: "center",
//         }}
//       >
//         Management User
//       </Title>

//       {loading ? (
//         <Spin
//           size="large"
//           style={{ display: "block", textAlign: "center", marginTop: 50 }}
//         />
//       ) : (
//         <div>
//           <Table
//             dataSource={users}
//             columns={columns}
//             rowKey="id"
//             loading={loading}
//           />
//           {/* {users.map((user) => (
//             <Col xs={24} sm={12} md={8} lg={6} key={user.id}>
//               <Card
//                 title={<Text strong>{user.email}</Text>}
//                 bordered={false}
//                 style={{
//                   textAlign: "center",
//                   boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
//                 }}
//               >
//                 <p>
//                   <strong>Name:</strong> {user.firstName} {user.lastName}
//                 </p>
//                 <p>
//                   <strong>Phone:</strong> {user.phone}
//                 </p>

//                 <Popconfirm
//                   title="Are you sure to delete this user?"
//                   onConfirm={() => deleteUser(user.id, setUsers, setLoading)}
//                   okText="Yes"
//                   cancelText="No"
//                 >
//                   <Button type="primary" danger>
//                     Delete User
//                   </Button>
//                 </Popconfirm>
//               </Card>
//             </Col>
//           ))} */}
//         </div>
//       )}
//       <Modal
//         title="แก้ไขผู้ใช้"
//         open={editModalVisible}
//         onCancel={() => setEditModalVisible(false)}
//         onOk={handleUpdateUser}
//         okText="อัปเดต"
//         cancelText="ยกเลิก"
//       >
//         <Form form={formEdit} layout="vertical">
//           <Form.Item name="firstName" label="ชื่อ" rules={[{ required: true }]}>
//             <Input />
//           </Form.Item>
//           <Form.Item
//             name="lastName"
//             label="นามสกุล"
//             rules={[{ required: true }]}
//           >
//             <Input />
//           </Form.Item>

//           <Form.Item name="phone" label="เบอร์โทร" rules={[{ required: true }]}>
//             <Input type="number" />
//           </Form.Item>
//         </Form>
//       </Modal>
//     </div>
//   );
// };
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  message,
  Popconfirm,
  Skeleton,
  Spin,
} from "antd";
import { CloseOutlined } from "@ant-design/icons";
import axios from "axios";

import { useEffect, useRef, useState } from "react";
import { authUser, PATH_API } from "../../constrant";
export const UserManagementPage = (props) => {
  const dataFetchedRef = useRef(false);
  const presidentData = props.data;
  const [form] = Form.useForm();
  const [usersData, setUsersData] = useState();
  const onFinish = async (values) => {
    console.log("Success:", values.items[0]);
    console.log("PAONN", values);

    for (var i = 0; i < values.items.length; i++) {
      console.log(values.items[i]);
      await axios
        .post(PATH_API + "/users/create", {
          ...values.items[i],
          IsPresident: "No",
          GroupId: teamData.id,
        })
        .then((res) => {
          console.log("Created", res);
        });
    }
  };
  const cancel = (e) => {
    console.log(e);
    message.error("Click on No");
  };
  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };
  // const getTeamMembers = async () => {
  //   await axios
  //     .get(PATH_API + `/users/getteammembers/${teamData.id}`)
  //     .then((res) => {
  //       console.log("ffffffff", res);

  //       form.setFieldValue("items", res.data);
  //     });
  // };
  const confirm = () => {
    const memberId = form.getFieldValue(["items", field.name, "id"]); // ดึงค่า id ของสมาชิก
    console.log("Deleting member with ID:", memberId);

    if (memberId) {
      axios
        .post(`${PATH_API}/users/delete/${memberId}/${authUser.uid}`)
        .then((res) => {
          console.log("Member deleted:", res);
        })
        .catch((err) => {
          console.error("Error deleting member:", err);
        });
    }
  };
  const getUser = async () => {
    await axios.get(PATH_API + `/users/get`).then((res) => {
      console.log("getUser", res.data);

      setUsersData(res.data);
      form.setFieldValue("items", res.data);
    });
  };
  useEffect(() => {
    if (dataFetchedRef.current) return;
    dataFetchedRef.current = true;
    getUser();
    // getTeamMembers();
  }, []);
  return (
    <>
      {usersData ? (
        <>
          <h1>ข้อมูลผู้ใช้ทั้งระบบ</h1>
          <Form
            labelCol={{
              span: 6,
            }}
            wrapperCol={{
              span: 18,
            }}
            form={form}
            name="dynamic_form_complex"
            style={{
              maxWidth: 600,
            }}
            autoComplete="off"
            initialValues={{
              items: [{}],
            }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
          >
            <Form.List name="items">
              {(fields, { add, remove }) => (
                <div
                  style={{
                    display: "flex",
                    rowGap: 16,
                    flexDirection: "column",
                  }}
                >
                  {fields.map((field) => (
                    <Card
                      size="small"
                      title={(() => {
                        const memberId = form.getFieldValue([
                          "items",
                          field.name,
                          "id",
                        ]); // ดึง id จากฟอร์ม
                        const isPresident = presidentData
                          ? memberId === presidentData.id &&
                            presidentData.IsPresident === "Yes"
                            ? "หัวหน้าทีม"
                            : "สมาชิก"
                          : null;

                        return isPresident;
                      })()}
                      key={field.key}
                      extra={
                        <CloseOutlined
                          onClick={() => {
                            <Popconfirm
                              title="Delete the task"
                              description="Are you sure to delete this task?"
                              onConfirm={confirm}
                              onCancel={cancel}
                              okText="Yes"
                              cancelText="No"
                            >
                              <Button danger>Delete</Button>
                            </Popconfirm>;
                            // remove(field.name); // ลบฟอร์มของสมาชิกออกจาก UI
                          }}
                        />
                      }
                    >
                      <Form.Item label="id" name={[field.name, "id"]}>
                        <Input disabled={true} />
                      </Form.Item>
                      <Form.Item
                        label="ชื่อ"
                        name={[field.name, "FirstName"]}
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
                        label="นามสกุล"
                        name={[field.name, "LastName"]}
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
                        label="เลขบัตรประชาชน"
                        name={[field.name, "NationalId"]}
                        rules={[
                          {
                            required: true,
                            message: "Please input your Email!",
                          },
                        ]}
                      >
                        <Input />
                      </Form.Item>

                      {/* <Form.Item
                      label="วันเกิด"
                      name={[field.name, "DateofBirth"]}
                      // rules={[
                      //   {
                      //     required: true,
                      //     message: "Please input your Email!",
                      //   },
                      // ]}
                    >
                      <DatePicker />
                    </Form.Item> */}

                      <Form.Item
                        label="อาชีพ"
                        name={[field.name, "Occupation"]}
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
                        label="สังกัดสถานศึกษา"
                        name={[field.name, "AffiliatedAgency"]}
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
                        label="ที่อยู่ปัจจุบัน"
                        name={[field.name, "Address1"]}
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
                        label="เบอร์ติดต่อ"
                        name={[field.name, "Phone"]}
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
                        label="Line ID"
                        name={[field.name, "LineId"]}
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
                        label="Email"
                        name={[field.name, "Email"]}
                        rules={[
                          {
                            required: true,
                            message: "Please input your Email!",
                          },
                        ]}
                      >
                        <Input />
                      </Form.Item>
                    </Card>
                  ))}

                  <Button type="dashed" onClick={() => add()} block>
                    + เพิ่มสมาชิก
                  </Button>
                </div>
              )}
            </Form.List>
            <Form.Item label={null}>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </Form.Item>
          </Form>
        </>
      ) : (
        <Card>
          <Spin tip=" กำลังรับข้อมูล..." />

          <Skeleton active />
        </Card>
      )}
    </>
  );
};
