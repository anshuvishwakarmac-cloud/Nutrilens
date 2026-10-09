import axiosClient from './axiosClient';

export const analyzeMeal = (file) => {
  const formData = new FormData();
  formData.append('image', file);
  return axiosClient.post('/meals/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const saveMeal = (mealData) => axiosClient.post('/meals', mealData);
export const getMeals = (params) => axiosClient.get('/meals', { params });
export const getMeal = (id) => axiosClient.get(`/meals/${id}`);
export const updateMeal = (id, data) => axiosClient.put(`/meals/${id}`, data);
export const deleteMeal = (id) => axiosClient.delete(`/meals/${id}`);
