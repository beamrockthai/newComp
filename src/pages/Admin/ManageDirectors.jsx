import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Row,
  Col,
  Modal,
  message,
  Popconfirm,
} from "antd";
import { useUserAuth } from "../../Context/UserAuth";
import {
  loadDirectors,
  addDirector,
  deleteDirector,
} from "../../services/directorFunctions";
import { useNavigate } from "react-router-dom";
import TableComponent from "../../components/TableComponent";

export const ManageDirectors = () => {
  const { signUpDirector } = useUserAuth();
  const [loading, setLoading] = useState(false);
  const [directors, setDirectors] = useState([]);
  const [passwords, setPasswords] = useState({});
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [formValues, setFormValues] = useState(null); // ✅ เก็บค่าฟอร์มก่อนสมัคร
  const navigate = useNavigate();

  useEffect(() => {
    loadDirectors(setDirectors);
  }, []);

  // เปิด Popup ยืนยันก่อนสมัคร
  const showConfirmModal = (values) => {
    setFormValues(values);
    setIsConfirmModalOpen(true);
  };

  // ยืนยันสมัครกรรมการ
  const handleConfirmRegister = async () => {
    setLoading(true);
    setIsConfirmModalOpen(false); //  ปิด popup ยืนยัน

    try {
      await addDirector(
        formValues,
        signUpDirector,
        setPasswords,
        setDirectors,
        form
      );
      message.success("กรรมการถูกเพิ่มเรียบร้อยแล้ว");
      setIsModalOpen(false);
      form.resetFields();
      navigate("/manage-directors");
    } catch (error) {
      message.error("เกิดข้อผิดพลาดในการเพิ่มกรรมการ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      {/* Header Section */}
      <Row
        justify="space-between"
        align="middle"
        style={{ marginBottom: "20px" }}
      >
        <Col>
          <h2 style={{ margin: 0, color: "#b12341" }}>จัดการกรรมการ</h2>
        </Col>
        <Col>
          <Button
            type="primary"
            onClick={() => setIsModalOpen(true)}
            style={{ backgroundColor: "#b12341", borderColor: "#b12341" }}
          >
            เพิ่มกรรมการ
          </Button>
        </Col>
      </Row>

      {/* TableComponent */}
      <TableComponent
        columns={[
          { title: "First Name", dataIndex: "firstName", align: "left" },
          { title: "Last Name", dataIndex: "lastName", align: "left" },
          { title: "ID Card", dataIndex: "idCard", align: "left" },
          { title: "Address", dataIndex: "address", align: "left" },
          { title: "Email", dataIndex: "email", align: "left" },
          { title: "Role", dataIndex: "role", align: "left" },
          {
            title: "Password",
            dataIndex: "email",
            align: "left",
            render: (email) => passwords[email] || "N/A",
          },
          {
            title: "Actions",
            dataIndex: "id",

            render: (id) => (
              <Popconfirm
                title="คุณแน่ใจหรือไม่ว่าต้องการลบ ?"
                onConfirm={() => deleteDirector(id, setDirectors)}
              >
                <Button danger>ลบ</Button>
              </Popconfirm>
            ),
          },
        ]}
        dataSource={directors}
        bordered={true}
        loading={loading}
        pagination={{ pageSize: 5 }}
        rowKey="id"
        onRowClick={(record) => console.log(record)}
      />

      {/* Modal for Adding Director */}
      <Modal
        title="เพิ่มกรรมการ"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form layout="vertical" onFinish={showConfirmModal} form={form}>
          <Form.Item
            name="firstName"
            label="ชื่อ"
            rules={[{ required: true, message: "Please enter first name!" }]}
          >
            <Input placeholder="Enter First Name" />
          </Form.Item>

          <Form.Item
            name="lastName"
            label="นามสกุล"
            rules={[{ required: true, message: "Please enter last name!" }]}
          >
            <Input placeholder="Enter Last Name" />
          </Form.Item>

          <Form.Item
            name="idCard"
            label="บัตรประชาชน"
            rules={[
              { required: true, message: "Please enter ID card number!" },
              { len: 13, message: "ID card number must be 13 digits!" },
            ]}
          >
            <Input placeholder="Enter ID Card Number" />
          </Form.Item>

          <Form.Item
            name="address"
            label="ที่อยู่"
            rules={[{ required: true, message: "Please enter address!" }]}
          >
            <Input.TextArea placeholder="Enter Address" rows={2} />
          </Form.Item>

          <Form.Item
            name="email"
            label="อีเมล"
            rules={[
              {
                required: true,
                type: "email",
                message: "Please enter a valid email!",
              },
            ]}
          >
            <Input placeholder="Enter Director Email" />
          </Form.Item>

          <Form.Item
            name="password"
            label="รหัสผ่าน"
            rules={[{ required: true, message: "Please enter a password!" }]}
          >
            <Input.Password placeholder="Enter Password" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block loading={loading}>
            เพิ่มกรรมการ
          </Button>
        </Form>
      </Modal>

      {/* Modal Popup ยืนยันการสมัคร */}
      <Modal
        title="ยืนยันข้อมูล"
        open={isConfirmModalOpen}
        onOk={handleConfirmRegister}
        onCancel={() => setIsConfirmModalOpen(false)}
        okText="ยืนยัน"
        cancelText="ยกเลิก"
      >
        <p>โปรดตรวจสอบข้อมูลให้ถูกต้องก่อนยืนยันการเพิ่มกรรมการ</p>
        <ul>
          <li>
            <b>ชื่อ:</b> {formValues?.firstName} {formValues?.lastName}
          </li>
          <li>
            <b>บัตรประชาชน:</b> {formValues?.idCard}
          </li>
          <li>
            <b>ที่อยู่:</b> {formValues?.address}
          </li>
          <li>
            <b>อีเมล:</b> {formValues?.email}
          </li>
        </ul>
      </Modal>
    </div>
  );
};
