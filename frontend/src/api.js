import axios from "axios";
const BASE = "http://localhost:8000";

export const sendMessage = (data) => axios.post(`${BASE}/tutor/chat`, data);
export const generateCurriculum = (data) => axios.post(`${BASE}/curriculum/generate`, data);
export const getCurriculum = (userId, subject) => axios.get(`${BASE}/curriculum/get/${userId}/${subject}`);
export const advanceTopic = (curriculumId) => axios.post(`${BASE}/curriculum/advance/${curriculumId}`);
