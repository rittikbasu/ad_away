import OpenAI from "openai";
import { OPENAI_MODEL } from "./config/constants";
import { log } from "./utils/logger";
import { SYSTEM_PROMPT } from "./config/prompts";

let currentVideoTimestamps = null;

const getApiKey = async () => {
  const data = await chrome.storage.sync.get("apiKey");
  if (!data.apiKey) {
    throw new Error("No API key found");
  }
  return data.apiKey;
};

const combineSubtitles = (subtitles) => {
  return subtitles.reduce(
    (acc, sub) => {
      const timeInSeconds = sub.offset / 1000;
      acc.text += `[${timeInSeconds}] ${sub.text}\n`;
      acc.totalDuration = (sub.offset + sub.duration) / 1000;
      return acc;
    },
    { text: "", totalDuration: 0 }
  );
};

const validateSegments = (segments) => {
  return (
    Array.isArray(segments) &&
    segments.every(
      (segment) =>
        typeof segment.start === "number" &&
        typeof segment.end === "number" &&
        segment.start < segment.end
    )
  );
};

const getSystemPrompt = () => SYSTEM_PROMPT;

const detectSponsorSection = async (text) => {
  try {
    const apiKey = await getApiKey();
    const openai = new OpenAI({ apiKey });

    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: getSystemPrompt(),
        },
        {
          role: "user",
          content: `Analyze this transcript and identify ALL sponsored sections, including any lead-in stories or context switches. Each line starts with a timestamp in seconds:\n\n${text}`,
        },
      ],
    });

    const result = JSON.parse(response.choices[0].message.content);

    if (!validateSegments(result.segments)) {
      throw new Error("Invalid segments format received from API");
    }

    return result.segments.length > 0 ? result.segments : "NONE";
  } catch (error) {
    log.error("Sponsorship detection failed:", error);
    return "NONE";
  }
};

// Initialize message listeners
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "DETECT_SPONSORSHIP") {
    currentVideoTimestamps = null;

    const { text } = combineSubtitles(request.subtitles);

    detectSponsorSection(text).then((timestamps) => {
      currentVideoTimestamps = timestamps !== "NONE" ? timestamps : null;
      sendResponse({
        timestamps: currentVideoTimestamps,
      });
    });

    return true;
  } else if (request.type === "CLEAR_TIMESTAMPS") {
    currentVideoTimestamps = null;
    sendResponse({ success: true });
    return true;
  }
});

// Handle installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    chrome.tabs.create({
      url: chrome.runtime.getURL("popup.html"),
    });
  }
});
