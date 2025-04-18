import React, { useState, useEffect } from "react";
import { Table, Button, Typography, message, Spin } from "antd";
import { fetchUserRegistrations } from "../services/fetchUserRegistrations";
import { cancelRegistration } from "../services/cancelRegistration";
import { useUserAuth } from "../Context/UserAuth";
import HeaderList from "../components/HeaderList";

const { Title } = Typography;

const UserRegisteredList = () => {
  const { userId } = useUserAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadRegistrations();
    }
  }, [userId]);

  const loadRegistrations = async () => {
    if (!userId) {
      message.error("ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่");
      return;
    }

    setLoading(true);
    try {
      const data = await fetchUserRegistrations(userId);
      setRegistrations(data);
    } catch (error) {
      message.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (registrationId, tournamentId) => {
    try {
      await cancelRegistration(registrationId, tournamentId);
      message.success("ยกเลิกการสมัครเรียบร้อยแล้ว");
      loadRegistrations();
    } catch (error) {
      message.error("เกิดข้อผิดพลาดในการยกเลิกการสมัคร");
    }
  };

  const columns = [
    {
      title: "ชื่อการแข่งขัน",
      dataIndex: "tournamentName",
      key: "tournamentName",
    },
    {
      title: "ประเภท",
      dataIndex: "teamType",
      key: "teamType",
      render: (type) => (type === "individual" ? "เดี่ยว" : "ทีม"),
    },
    {
      title: "ชื่อทีม",
      dataIndex: "teamName",
      key: "teamName",
      render: (_, record) =>
        record.teamType === "team" ? record.teamName || "ไม่ได้ระบุ" : "-",
    },
    {
      title: "สมาชิกในทีม",
      key: "teamMembers",
      render: (_, record) =>
        record.teamType === "team" ? (
          record.teamMembers && record.teamMembers.length > 0 ? (
            <ul style={{ paddingLeft: "16px" }}>
              {record.teamMembers.map((member, idx) => (
                <li key={idx}>{member}</li>
              ))}
            </ul>
          ) : (
            <span style={{ color: "#aaa" }}>ไม่มีสมาชิกในทีม</span>
          )
        ) : (
          "-"
        ),
    },
    {
      title: "การจัดการ",
      key: "action",
      render: (_, record) => (
        <Button
          danger
          onClick={() => handleCancel(record.id, record.tournamentId)}
        >
          ยกเลิกการสมัคร
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: "25px", maxWidth: "1200px", margin: "auto" }}>
      <HeaderList />

      {/* <Title level={2} style={{ textAlign: "center", color: "#1890ff" }}>
        รายการที่คุณลงทะเบียนไว้
      </Title> */}

      {loading ? (
        <div style={{ textAlign: "center", marginTop: "25px" }}>
          <Spin size="large" />
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={registrations}
          rowKey="id"
          pagination={{ pageSize: 6 }}
          locale={{ emptyText: "ยังไม่มีการแข่งขันที่คุณสมัคร" }}
        />
      )}
    </div>
  );
};

export default UserRegisteredList;
