import { BUTTON_STYLES } from "./config/constants";
import { log } from "./utils/logger";

const SUBTITLE_TOGGLE_DELAY = 100;
const VIDEO_PROCESS_DELAY = 1000;

//DOM selectors
const SELECTORS = {
  player: ".html5-video-player",
  video: "video",
  subtitlesButton: ".ytp-subtitles-button",
  skipButton: ".sponsor-skip-button",
};

const getElements = () => {
  const elements = {
    player: document.querySelector(SELECTORS.player),
    video: document.querySelector(SELECTORS.video),
    subtitlesButton: document.querySelector(SELECTORS.subtitlesButton),
  };

  return elements;
};

const injectStyles = () => {
  const style = document.createElement("style");
  style.textContent = BUTTON_STYLES;
  document.head.appendChild(style);
};

const createSkipButton = (segment, video) => {
  const skipButton = document.createElement("button");
  skipButton.className = "sponsor-skip-button";
  skipButton.innerHTML = `
    Skip Sponsor
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-skip-forward"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" x2="19" y1="5" y2="19"/></svg>
  `.trim();

  const handleClick = () => {
    video.currentTime = segment.end;
    skipButton.remove();
  };

  skipButton.addEventListener("click", handleClick);

  return {
    element: skipButton,
    ...segment,
    cleanup: () => skipButton.removeEventListener("click", handleClick),
  };
};

const createTimeUpdateHandler = (buttons, player) => {
  return () => {
    const { video } = getElements();
    const currentTime = video.currentTime;

    buttons.forEach(({ element, start, end }) => {
      const isWithinSegment = currentTime >= start && currentTime < end;
      const isButtonVisible = player.contains(element);

      if (isWithinSegment && !isButtonVisible) {
        log.debug(`Adding skip button: ${start} -> ${end}`);
        player.appendChild(element);
        activeButtons.push(element);
      } else if (!isWithinSegment && isButtonVisible) {
        log.debug(`Removing skip button: ${start} -> ${end}`);
        element.remove();
        activeButtons = activeButtons.filter((btn) => btn !== element);
      }
    });
  };
};

const createKeyPressHandler = (buttons) => {
  return (event) => {
    if (event.key === "Enter") {
      const { video } = getElements();
      const currentTime = video.currentTime;
      const activeSegment = buttons.find(
        ({ start, end }) => currentTime >= start && currentTime < end
      );

      if (activeSegment) {
        video.currentTime = activeSegment.end;
        activeSegment.element.remove();
      }
    }
  };
};

const toggleSubtitles = async (button) => {
  button.click();
  await new Promise((resolve) => setTimeout(resolve, SUBTITLE_TOGGLE_DELAY));
};

const fetchTranscriptData = () => {
  return new Promise((resolve) => {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();

      for (const entry of entries) {
        if (entry.name.startsWith("https://www.youtube.com/api/timedtext")) {
          fetch(entry.name)
            .then((response) => response.json())
            .then((data) => {
              observer.disconnect();
              resolve(data);
            });
          break;
        }
      }
    });

    observer.observe({ entryTypes: ["resource"] });
  });
};

const processTranscriptData = (data) => {
  if (!data?.events) return null;

  return data.events
    .filter(
      (event) => event.segs && !event.segs[0]?.utf8?.trim().startsWith("\n")
    )
    .map((event) => ({
      offset: event.tStartMs,
      duration: event.dDurationMs || 0,
      text: event.segs
        .map((seg) => seg.utf8)
        .filter(Boolean)
        .join("")
        .replace(/\n/g, "")
        .trim(),
    }))
    .filter((subtitle) => subtitle.text);
};

const getSubtitles = async () => {
  log.debug("Starting subtitle fetch process...");
  const { subtitlesButton } = getElements();

  if (!subtitlesButton) {
    log.warn("Subtitles button not found");
    return null;
  }

  const wasInitiallyOn =
    subtitlesButton.getAttribute("aria-pressed") === "true";

  log.debug("Was initially on:", wasInitiallyOn);

  try {
    if (wasInitiallyOn) {
      await toggleSubtitles(subtitlesButton);
    }

    await toggleSubtitles(subtitlesButton);
    const transcriptData = await fetchTranscriptData();
    log.debug("Transcript data:", transcriptData);

    if (!wasInitiallyOn) {
      await toggleSubtitles(subtitlesButton);
    }

    return processTranscriptData(transcriptData);
  } catch (error) {
    log.error("Error fetching subtitles:", error);
    return null;
  }
};

// Main Functions
let currentCleanupFunction = null;
let activeButtons = [];

const setupSkipButtons = (segments) => {
  const { player, video } = getElements();

  if (!player || !video) {
    log.warn("Player or video element not found");
    return null;
  }

  if (currentCleanupFunction) {
    currentCleanupFunction();
    currentCleanupFunction = null;
  }

  const buttons = segments.map((segment) => createSkipButton(segment, video));
  const handleTimeUpdate = createTimeUpdateHandler(buttons, player);
  const handleKeyPress = createKeyPressHandler(buttons);

  document.addEventListener("keydown", handleKeyPress);
  video.addEventListener("timeupdate", handleTimeUpdate);

  currentCleanupFunction = () => {
    document.removeEventListener("keydown", handleKeyPress);
    video.removeEventListener("timeupdate", handleTimeUpdate);
    buttons.forEach((button) => button.cleanup());
  };

  return currentCleanupFunction;
};

const cleanupVideoElements = () => {
  activeButtons.forEach((button) => button?.remove());
  activeButtons = [];

  document
    .querySelectorAll(SELECTORS.skipButton)
    .forEach((button) => button.remove());

  if (currentCleanupFunction) {
    currentCleanupFunction();
    currentCleanupFunction = null;
  }
};

const processVideo = async () => {
  log.debug("Processing video...");

  // Clean up before processing
  cleanupVideoElements();

  const subtitles = await getSubtitles();

  if (subtitles) {
    chrome.runtime.sendMessage(
      { type: "DETECT_SPONSORSHIP", subtitles },
      (response) => {
        log.debug("Received response from background:", response);
        if (response?.timestamps && Array.isArray(response.timestamps)) {
          setupSkipButtons(response.timestamps);
        }
      }
    );
  }
};

const createUrlChangeHandler = () => {
  let lastUrl = location.href;

  return () => {
    if (location.href === lastUrl) return;

    lastUrl = location.href;
    cleanupVideoElements();

    chrome.runtime.sendMessage({ type: "CLEAR_TIMESTAMPS" }, () => {
      setTimeout(processVideo, VIDEO_PROCESS_DELAY);
    });
  };
};

const init = () => {
  injectStyles();

  const observer = new MutationObserver(createUrlChangeHandler());
  observer.observe(document, { subtree: true, childList: true });

  setTimeout(processVideo, VIDEO_PROCESS_DELAY);
};

init();
