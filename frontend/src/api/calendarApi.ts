import api from "./axios";

export const calendarApi = {
  getNonWorkingDays: async (year: number): Promise<string[]> => {
    const response = await api.get("/api/v1/calendar/holidays", {
      params: { year },
    });
    return response.data;
  },

  getPublicHolidays: async (year: number): Promise<string[]> => {
    const response = await api.get("/api/v1/calendar/public-holidays", {
      params: { year },
    });
    return response.data;
  },
};
