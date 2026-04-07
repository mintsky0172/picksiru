import AsyncStorage from "@react-native-async-storage/async-storage";
import * as StoreReview from "expo-store-review";

const REVIEW_STATE_KEY = "review-prompt-state";
const MIN_ACTIONS_BEFORE_PROMPT = 4;
const PROMPT_PROBABILITY = 0.2;
const PROMPT_COOLDOWN_MS = 1000 * 60 * 60 * 24 * 21;
const MAX_PROMPT_COUNT = 3;

type ReviewState = {
  actionsSinceLastPrompt: number;
  lastPromptAt: number | null;
  promptCount: number;
};

const DEFAULT_STATE: ReviewState = {
  actionsSinceLastPrompt: 0,
  lastPromptAt: null,
  promptCount: 0,
};

async function getReviewState() {
  const raw = await AsyncStorage.getItem(REVIEW_STATE_KEY);
  if (!raw) return DEFAULT_STATE;

  try {
    return { ...DEFAULT_STATE, ...JSON.parse(raw) } as ReviewState;
  } catch {
    return DEFAULT_STATE;
  }
}

async function setReviewState(state: ReviewState) {
  await AsyncStorage.setItem(REVIEW_STATE_KEY, JSON.stringify(state));
}

export async function maybeRequestInAppReview() {
  const canRequestReview = await StoreReview.isAvailableAsync();
  if (!canRequestReview) return;

  const state = await getReviewState();
  const nextActions = state.actionsSinceLastPrompt + 1;
  const now = Date.now();
  const inCooldown =
    state.lastPromptAt !== null && now - state.lastPromptAt < PROMPT_COOLDOWN_MS;

  if (
    nextActions < MIN_ACTIONS_BEFORE_PROMPT ||
    inCooldown ||
    state.promptCount >= MAX_PROMPT_COUNT ||
    Math.random() > PROMPT_PROBABILITY
  ) {
    await setReviewState({
      ...state,
      actionsSinceLastPrompt: nextActions,
    });
    return;
  }

  await StoreReview.requestReview();
  await setReviewState({
    actionsSinceLastPrompt: 0,
    lastPromptAt: now,
    promptCount: state.promptCount + 1,
  });
}
