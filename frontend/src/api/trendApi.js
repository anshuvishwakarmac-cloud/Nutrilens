import axiosClient from './axiosClient';

export const getWeeklyTrends = (weeks = 4) =>
  axiosClient.get('/trends/weekly', { params: { weeks } });

export const getDailyTrends = (from, to) =>
  axiosClient.get('/trends/daily', { params: { from, to } });
