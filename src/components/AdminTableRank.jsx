import React, { useEffect, useState, useMemo } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  InputNumber,
  Select,
  message,
  Typography,
  Input,
} from "antd";
import {
  createScore,
  updateScore,
  deleteScore,
  GetAllScore,
} from "../services/RankingUsers";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

const { Title } = Typography;

const AdminTableRank = () => {
  const [scores, setScores] = useState([]);
  const [users, setUsers] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [searchTournament, setSearchTournament] = useState("");
  // const [searchRound, setSearchRound] = useState(""); ไว้ก่อน

  const fetchData = async () => {
    const data = await GetAllScore();
    setScores(data);
  };

  const fetchUsersAndTournaments = async () => {
    const userSnap = await getDocs(collection(db, "users"));
    const allUsers = userSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    const filteredUsers = allUsers.filter((user) => user.role === "user");
    setUsers(filteredUsers);

    const tournamentSnap = await getDocs(collection(db, "tournaments"));
    setTournaments(
      tournamentSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    );
  };

  useEffect(() => {
    fetchData();
    fetchUsersAndTournaments();
  }, []);

  const handleCreateOrUpdate = async (values) => {
    try {
      if (editingId) {
        await updateScore(editingId, values.score);
        message.success("อัปเดตคะแนนแล้ว");
      } else {
        await createScore(
          values.userId,
          values.tournamentId,
          values.score,
          values.round
        );
        message.success("เพิ่มคะแนนแล้ว");
      }
      fetchData();
      form.resetFields();
      setIsModalOpen(false);
      setEditingId(null);
    } catch (err) {
      console.error("Error:", err);
      message.error(err.message || "เกิดข้อผิดพลาด");
    }
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: "คุณแน่ใจหรือไม่?",
      content: "การลบจะไม่สามารถย้อนกลับได้",
      okText: "ลบ",
      okType: "danger",
      cancelText: "ยกเลิก",
      onOk: async () => {
        await deleteScore(id);
        message.success("ลบเรียบร้อย");
        fetchData();
      },
    });
  };

  const filteredScores = useMemo(() => {
    return scores.filter((score) => {
      const user = users.find((u) => u.id === score.userId);
      const tournament = tournaments.find((t) => t.id === score.tournamentId);

      const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`;
      const tournamentName = tournament?.tournamentName || "";

      const userMatch = fullName
        .toLowerCase()
        .includes(searchText.toLowerCase());
      const tournamentMatch = tournamentName
        .toLowerCase()
        .includes(searchTournament.toLowerCase());

      return userMatch && tournamentMatch;
    });
  }, [scores, users, tournaments, searchText, searchTournament]);

  const columns = [
    {
      title: "ชื่อผู้ใช้",
      dataIndex: "userId",
      key: "userId",
      render: (id) => {
        const user = users.find((u) => u.id === id);
        return user ? `${user.firstName} ${user.lastName}` : id;
      },
    },

    {
      title: "ชื่อกีฬา",
      dataIndex: "tournamentId",
      key: "tournamentId",
      render: (id) =>
        tournaments.find((t) => t.id === id)?.tournamentName || id,
    },
    {
      title: "คะแนน",
      dataIndex: "score",
      key: "score",
    },

    {
      title: "รอบ",
      dataIndex: "round",
      key: "round",
    },

    {
      title: "การจัดการ",
      key: "action",
      render: (_, record) => (
        <>
          <Button
            type="link"
            onClick={() => {
              form.setFieldsValue(record);
              setEditingId(record.id);
              setIsModalOpen(true);
            }}
          >
            แก้ไข
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record.id)}>
            ลบ
          </Button>
        </>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1000, margin: "auto", padding: "20px" }}>
      <Title level={3} style={{ color: "#b12341" }}>
        จัดการคะแนนผู้ใช้
      </Title>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 16,
        }}
      >
        <Input.Search
          placeholder="ค้นหาชื่อผู้ใช้"
          allowClear
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 250 }}
        />

        <Input.Search
          placeholder="ค้นหาชื่อกีฬา"
          allowClear
          onChange={(e) => setSearchTournament(e.target.value)}
          style={{ width: 250 }}
        />

        {/* <Input.Search
          placeholder="ค้นหารอบการเเข่งขัน"
          allowClear
          onChange={(e) => setSearchTournament(e.target.value)}
          style={{ width: 250 }}
        /> ไว้ ก่อน*/}

        <Button danger type="primary" onClick={() => setIsModalOpen(true)}>
          เพิ่มคะแนน
        </Button>
      </div>

      <Table columns={columns} dataSource={filteredScores} rowKey="id" />

      <Modal
        title={editingId ? "แก้ไขคะแนน" : "เพิ่มคะแนน"}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingId(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
      >
        <Form form={form} onFinish={handleCreateOrUpdate} layout="vertical">
          {!editingId && (
            <>
              <Form.Item
                name="userId"
                label="ผู้ใช้"
                rules={[{ required: true }]}
              >
                <Select placeholder="เลือกผู้ใช้">
                  {users.map((user) => (
                    <Select.Option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="tournamentId"
                label="ชื่อกีฬา"
                rules={[{ required: true }]}
              >
                <Select placeholder="เลือกกีฬา">
                  {tournaments.map((t) => (
                    <Select.Option key={t.id} value={t.id}>
                      {t.tournamentName}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </>
          )}

          <Form.Item name="score" label="คะแนน" rules={[{ required: true }]}>
            <InputNumber min={0} max={100} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="round" label="รอบ" rules={[{ required: true }]}>
            <InputNumber min={0} max={100} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminTableRank;
