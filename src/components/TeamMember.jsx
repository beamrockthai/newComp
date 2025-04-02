import {
  Avatar,
  Button,
  Card,
  Col,
  DatePicker,
  Flex,
  Form,
  Image,
  Input,
  message,
  Popconfirm,
  Row,
  Select,
  Skeleton,
  Spin,
  Upload,
} from "antd";

import {
  CloseOutlined,
  LoadingOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { authUser, ImgUrl, PATH_API } from "../constrant";
import { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import buddhistEra from "dayjs/plugin/buddhistEra";
import weekday from "dayjs/plugin/weekday";
import localeData from "dayjs/plugin/localeData"; // เพิ่ม plugin นี้
import thLocale from "antd/es/date-picker/locale/th_TH";
import "dayjs/locale/th";
import { UploadProfilePicture } from "./Team/UploadProfilePicture";

dayjs.extend(customParseFormat);
dayjs.extend(buddhistEra);
dayjs.extend(weekday);
dayjs.extend(localeData); // เรียกใช้ localeData
dayjs.locale("th");
const dateFormat = "YYYY-MM-DD";
export const TeamMemberPage = () => {
  useEffect(() => {
    if (dataFetchedRef.current) return;
    dataFetchedRef.current = true;
    getMyTeam();
    getNamePrefixOptions();
    getOccupationOptions();
    // getTeamMembers();
  }, []);
  const dataFetchedRef = useRef(false);

  const [form] = Form.useForm();
  const [teamData, setTeamData] = useState();
  const [namePrefixOptions, setNamePrefixOptions] = useState();
  const [OccupationOptions, setOccupationOptions] = useState();
  const [optionsLoading, setOptionsLoading] = useState();
  const [buttonLoading, setButtonLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState();
  const [presidentData, setPresidentData] = useState();
  const handleChange = (info, name) => {
    console.log("handleChange", info.file);

    if (info.file.status === "uploading") {
      setLoading(true);
      return;
    }
    if (info.file.status === "done") {
      const newImageUrl = ImgUrl ? info.file.response : info.file.response;
      setImageUrl(newImageUrl);

      form.setFieldValue(["items", name, "ProfilePictureURL"], newImageUrl);
    }
  };
  const searchNationlId = (e, name) => {
    const numDigits = e.target.value.toString().length;
    if (numDigits === 13) {
      console.log(numDigits);
      const nid = e.target.value;
      axios.get(PATH_API + `/users/getbynid/${nid}`).then((udata) => {
        console.log("udata", udata);
        if (udata.data.id) {
          form.setFieldValue(["items", name, "NationalId"], null);
          message.error(
            "มีการใช้เลขบัตรประชาชนซ้ำ กรุณาตรวจสอบและลองใหม่อีกครั้ง",
            5
          );
        }
      });
    }
  };
  const beforeUpload = (file) => {
    console.log("beforeUpload", file);

    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("You can only upload JPG/PNG file!");
    }
    const isLt2M = file.size / 1024 / 1024 < 10;
    if (!isLt2M) {
      message.error("Image must smaller than 10MB!");
    }
    return isJpgOrPng && isLt2M;
  };
  const onFinish = async (values) => {
    console.log("Success:", values.items[0]);
    console.log("PAONN", values);
    setButtonLoading(true);
    for (var i = 0; i < values.items.length; i++) {
      console.log(dayjs(values.items[i].DateofBirth, "DDMMYYYY"));
      await axios
        .post(PATH_API + "/users/create", {
          ...values.items[i],
          IsPresident: values.items[i].IsPresident
            ? values.items.IsPresident
            : "No",
          GroupId: teamData.id,
          CreatedBy: authUser.id,
          Role: 4,
        })
        .then((res) => {
          if (res.status === 409) {
            message.error(
              "มีการใช้เลขบัตรประชาชนซ้ำ กรุณาตรวจสอบและลองใหม่อีกครั้ง",
              5
            );
          }
          console.log("Created", res);
          setButtonLoading(false);
        })
        .catch((err) => {
          message.error(
            "มีการใช้เลขบัตรประชาชนซ้ำบางรายการ กรุณาตรวจสอบและลองใหม่อีกครั้ง",
            5
          );
          setButtonLoading(false);
        });
    }
    message.success("บันทึกข้อมูลทีมสำเร็จแล้ว!", 5);
  };

  const onChange = (date, dateString) => {
    console.log(dateString);
    if (date) {
      const age = dayjs().diff(date, "year"); // คำนวณอายุ
      if (age < 15) {
        message.error("คุณต้องมีอายุอย่างน้อย 15 ปีขึ้นไป!", 5);
        form.setFieldsValue(["items", field.name, "DateofBirth"], null); // รีเซ็ตค่าในฟอร์ม
      } else {
        form.setFieldsValue(["items", field.name, "DateofBirth"], date); // อัปเดตค่าในฟอร์ม
      }
    }
  };
  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };
  const uploadButton = (
    <button
      style={{
        border: 0,
        background: "none",
      }}
      type="button"
    >
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div
        style={{
          marginTop: 8,
        }}
      >
        Upload
      </div>
    </button>
  );
  // const upload
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
      if (memberId === presidentData.id) {
        message.error("ไม่สามารถลบหัวหน้ากลุ่มออกจากทีมได้");
      } else {
        axios
          .post(`${PATH_API}/users/delete/${memberId}/${authUser.uid}`)
          .then((res) => {
            console.log("Member deleted:", res);
          })
          .catch((err) => {
            console.error("Error deleting member:", err);
          });
      }
    }
  };
  const getMyTeam = async () => {
    await axios
      .get(PATH_API + `/groups/getbyid/${authUser.uid}`)
      .then((res) => {
        setTeamData(res.data);
        axios
          .get(PATH_API + `/users/getbyid/${res.data.CreatedBy}`)
          .then((res) => {
            setPresidentData(res.data);
            setPresidentFormData(res.data);
            console.log(res.data);
          });
        axios
          .get(PATH_API + `/users/getteammembers/${res.data.id}`)
          .then((res) => {
            console.log("getteammembers", res);
            const newdata = res.data.map((e) => ({
              ...e,
              Occupation: e.OccupationId,
              DateofBirth: e.DateofBirth
                ? dayjs(e.DateofBirth, "YYYY-MM-DD")
                : null,
            }));
            console.log("newdata", newdata);

            form.setFieldValue("items", newdata);
          });
      });
  };
  const setPresidentFormData = (a) => {
    console.log("a", a);

    form.setFieldsValue({
      FirstName: a.FirstName || null,
      LastName: a.LastName || null,
      NationalId: a.NationalId || null,
      // DateofBirth: a.DateofBirth || null,
      Occupation: a.Occupation || null,
      AffiliatedAgency: a.AffiliatedAgency || null,
      Address1: a.Address1 || null,
      Address2: a.Address2 || null,
      AddressSubDistrict: a.AddressSubDistrict || null,
      AddressDistrict: a.AddressDistrict || null,
      AddressProvince: a.AddressProvince || null,
      Postcode: a.Postcode || null,
      Phone: a.Phone || null,
      Email: a.Email || null,
      LineId: a.LineId || null,
    });
  };
  const getNamePrefixOptions = async () => {
    setOptionsLoading(true);
    const nameprefixdata = await axios.get(PATH_API + `/name_prefixes/get`);
    console.log("nameprefixdata", nameprefixdata.data);

    setNamePrefixOptions(nameprefixdata.data);
    setOptionsLoading(false);
  };
  const getOccupationOptions = async () => {
    setOptionsLoading(true);
    const OccupationData = await axios.get(PATH_API + `/occupations/get`);
    console.log("OccupationData", OccupationData.data);

    setOccupationOptions(OccupationData.data);
    setOptionsLoading(false);
  };
  return (
    <>
      {/* {JSON.stringify(presidentData)} */}

      {teamData ? (
        <div>
          <h1>ข้อมูลสมาชิกในทีม</h1>
          <Form
            layout="vertical"
            labelCol={{
              span: 12,
            }}
            wrapperCol={{
              span: 24,
            }}
            form={form}
            name="dynamic_form_complex"
            style={{
              maxWidth: "100%",
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
                        <Popconfirm
                          title="คุณแน่ใจหรือไม่ว่าต้องการลบ?"
                          okText="ใช่"
                          cancelText="ไม่"
                          onConfirm={() => {
                            const memberId = form.getFieldValue([
                              "items",
                              field.name,
                              "id",
                            ]); // ดึงค่า id ของสมาชิก
                            console.log("Deleting member with ID:", memberId);

                            if (memberId) {
                              if (memberId === presidentData.id) {
                                message.error(
                                  "ไม่สามารถลบหัวหน้าออกจากทีมได้ หากต้องการเปลี่ยนแปลงกรุณาติดต่อผู้ดูแลระบบ",
                                  5
                                );
                              } else {
                                axios
                                  .post(
                                    `${PATH_API}/users/delete/${memberId}/${authUser.uid}`
                                  )
                                  .then((res) => {
                                    console.log("Member deleted:", res);
                                    message.success(
                                      "ลบข้อมูลสมาชิกออกจากทีมแล้ว",
                                      5
                                    );
                                    remove(field.name);
                                  })
                                  .catch((err) => {
                                    console.error(
                                      "Error deleting member:",
                                      err
                                    );
                                  });
                              }
                            } else if (!memberId) {
                              remove(field.name);
                            }
                          }}
                        >
                          <CloseOutlined
                            style={{ color: "red", cursor: "pointer" }}
                          />
                        </Popconfirm>
                      }
                    >
                      <Row gutter={[16, 16]}>
                        <Col xs={24} sm={24} md={12} lg={8} xl={8}>
                          <Form.Item
                            hidden="true"
                            label="id"
                            name={[field.name, "id"]}
                          >
                            <Input disabled={true} />
                          </Form.Item>
                          <Form.Item
                            label="ProfilePicture"
                            name={[field.name, "ProfilePicture"]}
                          >
                            <Flex gap="middle" wrap>
                              <Upload
                                name="Image"
                                listType="picture-circle"
                                className="avatar-uploader"
                                showUploadList={false}
                                action={PATH_API + "/upload"}
                                beforeUpload={beforeUpload}
                                onChange={(e) => handleChange(e, field.name)}
                              >
                                <Avatar
                                  size={100}
                                  src={
                                    ImgUrl +
                                    form.getFieldValue([
                                      "items",
                                      field.name,
                                      "ProfilePictureURL",
                                    ])
                                  }
                                  alt="avatar"
                                  className="profile-avatar"
                                  // style={{
                                  //   width: "100%",

                                  // objectFit: "cover", // ป้องกันการบิดเบี้ยว
                                  // }}
                                />
                              </Upload>
                            </Flex>
                            {/* <UploadProfilePicture /> */}
                          </Form.Item>
                          <Form.Item
                            label="คำนำหน้า"
                            name={[field.name, "NamePrefixId"]}
                          >
                            <Select
                              style={{ width: "100%" }}
                              dropdownStyle={{ whiteSpace: "normal" }}
                              loading={optionsLoading}
                              placeholder="คำนำหน้า"
                              showSearch
                              optionFilterProp="children" // ให้ค้นหาจาก children ของ Select.Option
                              filterOption={(input, option) =>
                                String(option.children)
                                  .toLowerCase()
                                  .includes(input.toLowerCase())
                              }
                            >
                              {namePrefixOptions
                                ? namePrefixOptions.map((item) => (
                                    <Select.Option
                                      key={item.id}
                                      value={item.PrefixCode}
                                      title={`${item.PrefixName}`}
                                      style={{ whiteSpace: "normal" }}
                                    >
                                      {item.PrefixName}
                                    </Select.Option>
                                  ))
                                : null}
                            </Select>
                          </Form.Item>
                          <Form.Item
                            label="ชื่อ"
                            name={[field.name, "FirstName"]}
                            rules={[
                              {
                                required: true,
                                message: "กรุณากรอกชื่อ!",
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
                                message: "กรุณากรอกนามสกุล!",
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
                                message: "กรุณากรอกเลขบัตรประชาชน!",
                              },
                              {
                                pattern: /^\d{13}$/,
                                message:
                                  "เลขบัตรประชาชนต้องมี 13 หลักและเป็นตัวเลขเท่านั้น!",
                              },
                            ]}
                          >
                            <Input
                              onChange={(e) => searchNationlId(e, field.name)}
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} md={12} lg={8} xl={8}>
                          <Form.Item
                            label="วัน/เดือน/ปี เกิด"
                            name={[field.name, "DateofBirth"]}
                            rules={[
                              {
                                required: true,
                                message: "กรุณาเลือกวันเกิด!",
                              },
                            ]}
                          >
                            <DatePicker locale={thLocale} onChange={onChange} />
                          </Form.Item>

                          <Form.Item
                            label="อาชีพ"
                            name={[field.name, "Occupation"]}
                            rules={[
                              {
                                required: true,
                                message: "กรุณากรอกอาชีพ!",
                              },
                            ]}
                          >
                            <Select
                              style={{ width: "100%" }}
                              dropdownStyle={{ whiteSpace: "normal" }}
                              loading={optionsLoading}
                              placeholder="เลือกอาชีพ"
                              showSearch
                              optionFilterProp="children" // ให้ค้นหาจาก children ของ Select.Option
                              filterOption={(input, option) =>
                                String(option.children)
                                  .toLowerCase()
                                  .includes(input.toLowerCase())
                              }
                            >
                              {OccupationOptions
                                ? OccupationOptions.map((item) => (
                                    <Select.Option
                                      key={item.id}
                                      value={item.id}
                                    >
                                      {item.OccupationName}
                                    </Select.Option>
                                  ))
                                : null}
                            </Select>
                          </Form.Item>

                          <Form.Item
                            label="สังกัดสถานศึกษา"
                            name={[field.name, "AffiliatedAgency"]}
                            rules={[
                              {
                                required: true,
                                message: "กรุณากรอกข้อมูล!",
                              },
                            ]}
                          >
                            <Input />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} md={12} lg={8} xl={8}>
                          <Form.Item
                            label="ที่อยู่ปัจจุบัน"
                            name={[field.name, "Address1"]}
                            rules={[
                              {
                                required: true,
                                message: "กรุณารอกที่อยู่ปัจจุบัน!",
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
                                message: "กรุณากรอกเบอร์โทร",
                              },
                              {
                                pattern: /^\d{9,10}$/,
                                message:
                                  "เบอร์โทรต้องมี 9 หรือ 10 หลัก และเป็นตัวเลขเท่านั้น!",
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
                        </Col>
                        <Col xs={24} sm={24} md={12} lg={8} xl={8}>
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
                        </Col>
                      </Row>
                    </Card>
                  ))}

                  {/* ซ่อนปุ่มเพิ่มสมาชิกเมื่อมีครบ 3 คน */}
                  {fields.length < 3 && (
                    <Button type="dashed" onClick={() => add()} block>
                      + เพิ่มสมาชิก
                    </Button>
                  )}
                </div>
              )}
            </Form.List>

            <Form.Item
              style={{
                marginTop: "16px",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Button type="primary" htmlType="submit">
                บันทึกสมาชิก
              </Button>
            </Form.Item>
          </Form>
        </div>
      ) : (
        <Card>
          <Spin />

          <Skeleton active />
        </Card>
      )}
    </>
  );
};
