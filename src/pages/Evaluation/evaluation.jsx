import React, { useState, useEffect } from "react";
import { Button } from "antd";
import {
  fetchForms,
  fetchDirectors,
  deleteForm,
} from "../../services/evaluation";
import FormModal from "./FormModal";
import AssignModal from "./AssignModal";
import EvaluationTable from "./EvaluationTable";
import { message } from "antd";

export const Evaluation = () => {
  const [forms, setForms] = useState([]);
  const [directors, setDirectors] = useState([]);
  const [isFormModalVisible, setIsFormModalVisible] = useState(false);
  const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
  const [editingForm, setEditingForm] = useState(null);
  const [selectedForm, setSelectedForm] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadForms();
    loadDirectors();
  }, []);

  const loadForms = async () => {
    setLoading(true);
    try {
      const fetchedForms = await fetchForms();
      setForms(fetchedForms);
    } catch (error) {
      console.error("Error fetching forms:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadDirectors = async () => {
    try {
      const fetchedDirectors = await fetchDirectors();
      setDirectors(fetchedDirectors);
    } catch (error) {
      console.error("Error fetching directors:", error);
    }
  };

  const handleDeleteForm = async (id) => {
    setLoading(true);
    try {
      await deleteForm(id);
      loadForms();
    } catch (error) {
      console.error("Error deleting form:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", color: "#b12341" }}>
      <h2>แบบประเมินการแข่งขัน</h2>
      <Button
        danger
        type="primary"
        onClick={() => setIsFormModalVisible(true)}
        style={{ marginBottom: "20px" }}
      >
        สร้างแบบประเมิน
      </Button>

      <EvaluationTable
        forms={forms}
        loading={loading}
        onEdit={(form) => {
          setEditingForm(form);
          setIsFormModalVisible(true);
        }}
        onDelete={handleDeleteForm}
        onAssign={(form) => {
          if (
            (form.assignedTo && form.assignedTo.length > 0) ||
            form.participantId
          ) {
            message.warning(
              "ฟอร์มนี้ได้ถูกมอบหมายไปแล้ว ไม่สามารถมอบหมายซ้ำได้"
            );
            return;
          }

          setSelectedForm(form);
          setIsAssignModalVisible(true);
        }}
      />

      <FormModal
        visible={isFormModalVisible}
        onClose={() => setIsFormModalVisible(false)}
        onFormSaved={loadForms}
        editingForm={editingForm}
      />

      <AssignModal
        visible={isAssignModalVisible}
        onClose={() => setIsAssignModalVisible(false)}
        selectedForm={selectedForm}
        directors={directors}
        onAssignSuccess={loadForms}
      />
    </div>
  );
};
