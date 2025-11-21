import axios from "axios";

// ZOOM_ACCOUNT_ID=e2U-hapPRee6HIWeEnb2DA
// ZOOM_CLIENT_ID=yWY4824hTOuY3W1kCkDO8g
// ZOOM_CLIENT_SECRET=lF93szc6l9veKVx0XIOOSm8O86e5Kd3T

const getZoomAccessToken = async () => {
  const res = await axios.post("https://zoom.us/oauth/token", null, {
    params: {
      grant_type: "account_credentials",
      account_id: "e2U-hapPRee6HIWeEnb2DA",
    },
    auth: {
      username: "yWY4824hTOuY3W1kCkDO8g" as string,
      password: "lF93szc6l9veKVx0XIOOSm8O86e5Kd3T" as string,
    },
  });

  return res.data.access_token;
};

export const createZoomMeeting = async (topic: string, startTime: string) => {
  const token = await getZoomAccessToken();

  try {
    const res = await axios.post(
      "https://api.zoom.us/v2/users/me/meetings",
      {
        topic,
        type: 2,
        start_time: startTime,
        duration: 2,
        settings: {
          host_video: true,
          participant_video: true,
          auto_recording: "cloud",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.data;
  } catch (err: any) {
    if (err.response) {
      console.error("Zoom API error:", err.response.data);
    } else {
      console.error("Unknown error:", err);
    }
    throw err;
  }
};

const getMeetingRecordings = async (meetingId: string) => {
  try {
    const token = await getZoomAccessToken();

    const res = await axios.get(
      `https://api.zoom.us/v2/meetings/${meetingId}/recordings`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log("Zoom Recording Response:", res.data);
    return res.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      console.error("Axios Error Response:", error.response?.data);
      console.error("Status Code:", error.response?.status);
      console.error("Headers:", error.response?.headers);
    } else {
      console.error("Unknown Error:", error);
    }
    throw new Error("Failed to fetch Zoom meeting recordings");
  }
};
export const rescheduleZoomMeeting = async (
  meetingId: string,
  newStartTime: string,
  newTopic?: string,
  newDuration?: number
) => {
  try {
    const token = await getZoomAccessToken();

    const payload: any = {
      start_time: newStartTime,
    };

    if (newTopic) payload.topic = newTopic;
    if (newDuration) payload.duration = newDuration;

    const res = await axios.patch(
      `https://api.zoom.us/v2/meetings/${meetingId}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Meeting rescheduled:", res.data);
    return res.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      console.error("Axios Error Response:", error.response?.data);
      console.error("Status Code:", error.response?.status);
      console.error("Headers:", error.response?.headers);
    } else {
      console.error("Unknown Error:", error);
    }
    throw new Error("Failed to reschedule Zoom meeting");
  }
};

export const cancelZoomMeeting = async (meetingId: string) => {
  try {
    const token = await getZoomAccessToken();

    await axios.delete(`https://api.zoom.us/v2/meetings/${meetingId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(`Meeting ${meetingId} cancelled successfully`);
    return { success: true, message: "Meeting cancelled successfully" };
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      console.error("Axios Error Response:", error.response?.data);
      console.error("Status Code:", error.response?.status);
      console.error("Headers:", error.response?.headers);
    } else {
      console.error("Unknown Error:", error);
    }
    throw new Error("Failed to cancel Zoom meeting");
  }
};


