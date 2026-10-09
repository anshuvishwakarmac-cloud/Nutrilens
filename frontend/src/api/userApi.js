import axiosClient from './axiosClient';

export const getProfile = () => axiosClient.get('/users/me');
export const updateProfile = (data) => axiosClient.put('/users/me', data);
