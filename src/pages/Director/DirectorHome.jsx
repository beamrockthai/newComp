import { Button, Modal, Result, Select, Spin, Table, Tag } from "antd";
import { useEffect, useState } from "react";
import { EvaluationForm } from "./EvaluationForm";
import axios from "axios";
import { authUser, EventId, PATH_API } from "../../constrant";
import { EvaluationHistoryPage } from "./EvaluationHistory";

export const DirectorHomePage = () => {
  const [modalData, setModalData] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpen2, setIsModalOpen2] = useState(false);
  const [roundOptions, setRoundOptions] = useState([]);
  const [defaultRoundOptions, setDefaultRoundOptions] = useState([]);
  const [selectedRound, setSelectedRound] = useState(null);
  const [loadings, setLoadings] = useState(false);
  const [data, setData] = useState();
  const onGetRoundOptions = async () => {
    try {
      const { data } = await axios.get(
        PATH_API + `/competition_rounds/get/${EventId}`
      );
      console.log("data", data);

      setRoundOptions(data);
      const df = data.filter((e) => e.IsCurrent === "Yes");
      console.log("df", df);
      setDefaultRoundOptions(df);

      if (df.length > 0) {
        setSelectedRound(df[0].id); // ✅ กำหนดค่าเริ่มต้น
      }
    } catch (error) {
      console.error("Error fetching round options:", error);
    }
  };
  const getMyEvaluationList = async (value) => {
    setLoadings(true);
    setSelectedRound(value);
    setData(null);
    const data = await axios.get(
      PATH_API +
        `/director_with_groups/getdirector/${authUser.uid}/${value}/${EventId}`
    );
    console.log("data", data);

    const adata = data.data.map((e) => ({
      GroupId: e.GroupId,
      TeamName: e.group.TeamName,
      CompetitionRoundId: e.CompetitionRoundId,
      CompetitionRound: e.competition_round.Details,
      CompetitionTypeId: e.CompetitionTypeId,
      CompetitionType: e.competition_type.CompetitionTypeName,
      Status: e.Status,
    }));
    setData(adata);
    setLoadings(false);

    return data.data;
  };

  const columns = [
    {
      title: "ชื่อทีม",
      dataIndex: "TeamName",
      key: "TeamName",
    },
    {
      title: "รอบ",
      dataIndex: "CompetitionRound",
      key: "CompetitionRoundId",
    },
    {
      title: "ประเภท",
      dataIndex: "CompetitionType",
      key: "CompetitionTypeId",
    },
    {
      title: "การจัดการ",
      dataIndex: "Status",
      key: "actions",
      render: (_, record) => (
        <>
          {record.Status === "No" ? (
            <Button type="primary" onClick={() => showModal(record)}>
              ประเมิน
            </Button>
          ) : (
            <Button type="default" onClick={() => showHistory(record)}>
              ประวัติประเมิน
            </Button>
          )}
          {/* <Button type="primary" onClick={() => showModal(record)}>
              ประเมิน
            </Button> */}
        </>
      ),
    },
  ];

  const showModal = (record) => {
    setModalData(record);
    setIsModalOpen(true);
  };
  const showHistory = (record) => {
    console.log("เปิดประวัติของ", record);
    setModalData(record);

    setIsModalOpen2(true);
    // สามารถเพิ่ม Modal หรือ Redirect ไปยังหน้าประวัติได้
  };
  const handleOk2 = () => {
    setIsModalOpen2(false);
    setModalData(null);
    onGetRoundOptions();
    getMyEvaluationList();
  };
  const handleCancel2 = () => {
    setIsModalOpen2(false);
    setModalData(null);
    onGetRoundOptions();
    getMyEvaluationList();
  };
  const handleOk = () => {
    setIsModalOpen(false);
    setModalData(null);
    onGetRoundOptions();
    getMyEvaluationList();
  };
  const handleCancel = () => {
    setIsModalOpen(false);
    onGetRoundOptions();
    getMyEvaluationList();
    setModalData(null);
  };
  useEffect(() => {
    onGetRoundOptions();
  }, []);

  useEffect(() => {
    if (selectedRound) {
      getMyEvaluationList(selectedRound);
    }
  }, [selectedRound]);
  return (
    <>
      {/* {JSON.stringify(data)} */}
      <h1>รายการที่ฉันต้องประเมิน</h1>
      <h1>
        รอบแข่งขันปัจจุบันในระบบ -{" "}
        {defaultRoundOptions.length > 0 ? (
          <Tag color="#2db7f5">{defaultRoundOptions[0].Details}</Tag>
        ) : (
          <Spin />
        )}
      </h1>
      <h3>กรุณาเลือกรอบแข่งขัน</h3>
      <Select
        style={{ width: 120, paddingBottom: 5 }}
        value={selectedRound} // ✅ ใช้ value แทน defaultValue
        onChange={(value) => getMyEvaluationList(value)} // ✅ อัปเดตค่าเมื่อเปลี่ยนรอบ
      >
        {roundOptions.map((e) => (
          <Select.Option key={e.id} value={e.id}>
            {e.Details}
          </Select.Option>
        ))}
      </Select>

      <Table loading={loadings} columns={columns} dataSource={data} />
      {/* <button onClick={() => setIsModalOpen2(true)}>เปิร์ด</button> */}
      <Modal
        title="Basic Modal"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        {modalData != 0 ? (
          modalData != null ? (
            <EvaluationForm data={modalData} />
          ) : (
            <Spin />
          )
        ) : (
          <Result title={"null"} />
        )}
      </Modal>
      <Modal
        title={`ประวัติประเมิน :` + modalData?.TeamName}
        open={isModalOpen2}
        onOk={handleOk2}
        onCancel={handleCancel2}
      >
        <h3>ประเภทแข่งขัน : {modalData?.CompetitionType} </h3>

        <h3>รอบประเมิน : {modalData?.CompetitionRound}</h3>
        <EvaluationHistoryPage data={modalData} />
      </Modal>
    </>
  );
};
