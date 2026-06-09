import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Teams
export const getTeams = () => API.get('/teams');
export const createTeam = (data) => API.post('/teams', data);
export const deleteTeam = (id) => API.delete(`/teams/${id}`);

// Equipment
export const getEquipment = () => API.get('/equipment');
export const getOneEquipment = (id) => API.get(`/equipment/${id}`);
export const createEquipment = (data) => API.post('/equipment', data);
export const updateEquipment = (id, data) => API.put(`/equipment/${id}`, data);
export const deleteEquipment = (id) => API.delete(`/equipment/${id}`);

// Requests
export const getRequests = () => API.get('/requests');
export const createRequest = (data) => API.post('/requests', data);
export const updateStage = (id, stage) => API.patch(`/requests/${id}/stage`, { stage });
export const getRequestsByEquipment = (equipmentId) =>
  API.get(`/requests/by-equipment/${equipmentId}`);