// ─── Action types ─────────────────────────────────────────────────────────────

export const ACTIONS = {
  SET_LOADING: "SET_LOADING",
  SET_YEAR: "SET_YEAR",
  SET_YEAR_DATA: "SET_YEAR_DATA",
  SET_YEAR_ERROR: "SET_YEAR_ERROR",
  SELECT_RACE: "SELECT_RACE",
  SELECT_SESSION: "SELECT_SESSION",
};

// ─── Pure helpers ─────────────────────────────────────────────────────────────

export function getUniqueRaces(racesData = []) {
  if (!racesData || racesData.length === 0) return [];

  const uniqueRacesMap = new Map();
  racesData.forEach((race) => {
    if (!uniqueRacesMap.has(race.round_number)) {
      uniqueRacesMap.set(race.round_number, race);
    }
  });
  return Array.from(uniqueRacesMap.values()).sort(
    (a, b) => a.round_number - b.round_number
  );
}

export function getAvailableSessions(race, racesData = []) {
  if (!race || !racesData) return [];
  return racesData
    .filter((r) => r.round_number === race.round_number)
    .map((r) => r.session_name)
    .filter((session, index, array) => array.indexOf(session) === index);
}

export function getSessionResults(race, sessionType, racesData = []) {
  if (!race || !racesData) return [];

  const session = racesData.find(
    (r) =>
      r.round_number === race.round_number && r.session_name === sessionType
  );

  if (session && session.results) {
    return [...session.results].sort((a, b) => a.Position - b.Position);
  }
  return [];
}

// ─── Initial state ────────────────────────────────────────────────────────────

export const initialState = {
  selectedYear: 2026,
  selectedRace: null,
  selectedSession: "Qualifying",
  sessionResults: [],
  isLoading: true,
  races: [],
  teamColors: {},
};

// ─── Reducer ──────────────────────────────────────────────────────────────────

export function sessionReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload };

    case ACTIONS.SET_YEAR:
      return { ...state, selectedYear: action.payload, isLoading: true };

    case ACTIONS.SET_YEAR_DATA: {
      const { races, teamColors } = action.payload;
      const uniqueRaces = getUniqueRaces(races);
      const firstRace = uniqueRaces[0] || null;
      const sessionResults = firstRace
        ? getSessionResults(firstRace, "Qualifying", races)
        : [];

      return {
        ...state,
        races,
        teamColors,
        selectedRace: firstRace,
        selectedSession: "Qualifying",
        sessionResults,
        isLoading: false,
      };
    }

    case ACTIONS.SET_YEAR_ERROR:
      return {
        ...state,
        races: [],
        teamColors: {},
        selectedRace: null,
        sessionResults: [],
        isLoading: false,
      };

    case ACTIONS.SELECT_RACE: {
      const race = action.payload;
      const availableSessions = getAvailableSessions(race, state.races);
      const newSession = availableSessions.includes(state.selectedSession)
        ? state.selectedSession
        : availableSessions[0] || "Race";
      const sessionResults = getSessionResults(race, newSession, state.races);

      return {
        ...state,
        selectedRace: race,
        selectedSession: newSession,
        sessionResults,
      };
    }

    case ACTIONS.SELECT_SESSION: {
      const sessionResults = getSessionResults(
        state.selectedRace,
        action.payload,
        state.races
      );
      return { ...state, selectedSession: action.payload, sessionResults };
    }

    default:
      return state;
  }
}