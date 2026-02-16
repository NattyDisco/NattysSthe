
import { GoogleGenAI, Chat } from "@google/genai";
import type { Employee, AttendanceRecord, Task, WorkingHoursSettings } from '../types.ts';
import { AttendanceStatus } from '../types.ts';
import { ATTENDANCE_STATUS_DETAILS } from '../constants';

// FIX: Removed global 'chat' instance to allow for fresh re-initialization with latest credentials if they change.
let chat: Chat | null = null;
let lastApiKey: string | undefined = undefined;

const initializeChat = (t: (key: string) => string) => {
    const apiKey = process.env.API_KEY;
    // FIX: Instantiate GoogleGenAI right before use. If the API key has changed, we must recreate the chat session to use the new credentials.
    if (!chat || apiKey !== lastApiKey) {
        const ai = new GoogleGenAI({ apiKey: apiKey });
        lastApiKey = apiKey;
        chat = ai.chats.create({
            model: 'gemini-3-flash-preview',
            config: {
                systemInstruction: t('gemini.system_instruction'),
            },
        });
    }
    return chat;
}

export const askAIChatbot = async (question: string, t: (key: string, replacements?: { [key: string]: string | number }) => string): Promise<string> => {
     if (!process.env.API_KEY) {
        return Promise.resolve(t('gemini.errors.api_key_not_configured'));
    }

    try {
        const chatInstance = initializeChat(t);
        const response = await chatInstance.sendMessage({ message: question });
        return response.text;
    } catch (error) {
        console.error("Error with Gemini Chatbot:", error);
         if (error instanceof Error) {
            return t('gemini.errors.generic_error', { message: error.message });
        }
        return t('gemini.errors.connection_error');
    }
}

export const resetChat = () => {
    chat = null;
    lastApiKey = undefined;
}

const generateAnalyticsPrompt = (
    employees: Employee[],
    records: AttendanceRecord[],
    startDate: string,
    endDate: string,
    t: (key: string, replacements?: { [key: string]: string | number }) => string
): string => {
    let dataSummary = `${t('gemini.analytics.period')}: ${startDate} to ${endDate}\n`;
    dataSummary += `${t('gemini.analytics.total_employees')}: ${employees.length}\n\n`;

    const employeeStats: { [id: string]: { name: string, P: number, A: number, L: number, S: number, R: number, O: number, total: number } } = {};
    employees.forEach(emp => {
        employeeStats[emp.id] = { name: `${emp.firstName} ${emp.surname}`, P: 0, A: 0, L: 0, S: 0, R: 0, O: 0, total: 0 };
    });

    records.forEach(rec => {
        if (employeeStats[rec.employeeId] && employeeStats[rec.employeeId].hasOwnProperty(rec.status)) {
            (employeeStats[rec.employeeId] as any)[rec.status]++;
            employeeStats[rec.employeeId].total++;
        }
    });
    
    dataSummary += `${t('gemini.analytics.employee_summary')}:\n`;
    Object.values(employeeStats).forEach(stat => {
        if (stat.total > 0) {
            dataSummary += `- ${stat.name}: P: ${stat.P}, A: ${stat.A}, L: ${stat.L}, S: ${stat.S}, R: ${stat.R}, O: ${stat.O}\n`;
        }
    });

    return t('gemini.analytics.prompt', { startDate, endDate, dataSummary });
};


export const generateDataAnalytics = async (
  employees: Employee[],
  records: AttendanceRecord[],
  startDate: string,
  endDate: string,
  t: (key: string, replacements?: { [key: string]: string | number }) => string
): Promise<string> => {
    if (!process.env.API_KEY) {
        return Promise.resolve(t('gemini.errors.insights_disabled'));
    }

    const prompt = generateAnalyticsPrompt(employees, records, startDate, endDate, t);

    try {
        // FIX: Instantiate GoogleGenAI right before the API call to ensure use of the most up-to-date API key.
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt
        });
        return response.text;
    } catch (error) {
        console.error("Error generating data analytics with Gemini API:", error);
        if (error instanceof Error) {
            return t('gemini.errors.analytics_error', { message: error.message });
        }
        return t('gemini.errors.unknown_analytics_error');
    }
};

export const getQuickDashboardInsight = async (
  employees: Employee[],
  records: AttendanceRecord[],
  t: (key: string) => string
): Promise<string> => {
  if (!process.env.API_KEY) return "";
  
  const today = new Date().toISOString().split('T')[0];
  const todayRecords = records.filter(r => r.date === today);
  const presentCount = todayRecords.filter(r => r.status === 'P').length;
  const leaveCount = todayRecords.filter(r => r.status === 'L' || r.status === 'S').length;
  
  const prompt = `Act as an HR consultant. Briefly analyze today's attendance: Total ${employees.length}, Present ${presentCount}, On Leave ${leaveCount}. Provide a one-sentence professional summary or management tip for today based on these numbers. Keep it concise and impactful.`;

  try {
      // FIX: Instantiate GoogleGenAI right before the API call to ensure latest credentials.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt,
      });
      return response.text || "";
  } catch (e) {
      return "";
  }
};

const parseTime = (timeStr: string): number => {
    if (!timeStr) return NaN;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
};

export const generatePerformanceInsights = async (
  employee: Employee,
  records: AttendanceRecord[],
  tasks: Task[],
  startDate: string,
  endDate: string,
  workingHoursSettings: WorkingHoursSettings,
  t: (key: string, replacements?: { [key: string]: string | number }) => string
): Promise<string> => {
  if (!process.env.API_KEY) {
    return Promise.resolve(t('gemini.errors.insights_disabled'));
  }

  const presentRecords = records.filter(r => r.status === 'P' || r.status === 'R');
  const lateRecords = presentRecords.filter(r => r.checkInTime && parseTime(r.checkInTime) > parseTime(workingHoursSettings.startTime));
  
  const totalCheckInMinutes = presentRecords.reduce((acc, r) => {
      if (!r.checkInTime) return acc;
      return acc + parseTime(r.checkInTime);
  }, 0);
  const avgCheckInMinutes = presentRecords.length > 0 ? totalCheckInMinutes / presentRecords.length : 0;
  const avgHour = Math.floor(avgCheckInMinutes / 60);
  const avgMin = Math.round(avgCheckInMinutes % 60);
  const avgCheckInTime = `${String(avgHour).padStart(2, '0')}:${String(avgMin).padStart(2, '0')}`;

  const leaveDays = records.filter(r => r.status === 'L' || r.status === 'S').length;
  
  const relevantTasks = tasks.filter(t => t.assigneeId === employee.id && t.dueDate >= startDate && t.dueDate <= endDate);
  const completedTasks = relevantTasks.filter(t => t.status === 'done');
  const completionRate = relevantTasks.length > 0 ? (completedTasks.length / relevantTasks.length) * 100 : 100;

  let dataSummary = `\n- ${t('gemini.performance.present_days')}: ${presentRecords.length}`;
  dataSummary += `\n- ${t('gemini.performance.late_days')}: ${lateRecords.length}`;
  dataSummary += `\n- ${t('gemini.performance.avg_check_in')}: ${avgCheckInTime}`;
  dataSummary += `\n- ${t('gemini.performance.leave_days')}: ${leaveDays}`;
  dataSummary += `\n- ${t('gemini.performance.tasks_assigned')}: ${relevantTasks.length}`;
  dataSummary += `\n- ${t('gemini.performance.tasks_completed')}: ${completedTasks.length}`;
  dataSummary += `\n- ${t('gemini.performance.completion_rate')}: ${completionRate.toFixed(0)}%`;

  const prompt = t('gemini.performance.prompt', { 
      employeeName: `${employee.firstName} ${employee.surname}`,
      startDate,
      endDate,
      dataSummary 
  });

  try {
    // FIX: Instantiate GoogleGenAI right before the API call to capture up-to-date API key.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "";
  } catch (error) {
    console.error("Error generating performance insights:", error);
    if (error instanceof Error) {
        return t('gemini.errors.analytics_error', { message: error.message });
    }
    return t('gemini.errors.unknown_analytics_error');
  }
};
