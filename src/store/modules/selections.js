export const initialState = {
    completedTraderQuest: true,
    playerlevel: 300,
};

const INCREASE_LEVEL = 'INCREASE_LEVEL';

const INCREASE_ATTRIBUTE = 'INCREASE_ATTRIBUTE';

const DECREASE_ATTRIBUTE = 'DECREASE_ATTRIBUTE';

const INCREASE_PERK = 'INCREASE_PERK';

const DECREASE_PERK = 'DECREASE_PERK';

const TOGGLE_TRADER_QUEST_COMPLETION = 'TOGGLE_TRADER_QUEST_COMPLETION';

export default function (state = initialState, action) {
    if (action.type === INCREASE_ATTRIBUTE) {
        const {
            [action.attribute]: currentLevel = 0,
        } = state;

        return {
            ...state,
            [action.attribute]: currentLevel + 1,
        };
    }

    if (action.type === DECREASE_ATTRIBUTE) {
        const {
            [action.attribute]: currentLevel = 0,
        } = state;

        return {
            ...state,
            [action.attribute]: currentLevel - 1,
        };
    }

    if (action.type === INCREASE_PERK) {
        const {
            [action.perk]: currentLevel = 0,
        } = state;

        return {
            ...state,
            [action.perk]: currentLevel + 1,
        };
    }

    if (action.type === DECREASE_PERK) {
        const {
            [action.perk]: currentLevel = 0,
        } = state;

        return {
            ...state,
            [action.perk]: currentLevel - 1,
        };
    }

    if (action.type === TOGGLE_TRADER_QUEST_COMPLETION) {
        return {
            ...state,
            completedTraderQuest: !state.completedTraderQuest,
        };
    }

    return state;
}

export const increaseLevel = () => ({
    type: INCREASE_LEVEL,
});

export const decreaseAttribute = attribute => ({
    type: DECREASE_ATTRIBUTE,
    attribute,
});

export const increaseAttribute = attribute => ({
    type: INCREASE_ATTRIBUTE,
    attribute,
});

export const increasePerk = perk => ({
    type: INCREASE_PERK,
    perk,
});

export const decreasePerk = perk => ({
    type: DECREASE_PERK,
    perk,
});

export const toggleTraderQuestCompletion = () => ({
    type: TOGGLE_TRADER_QUEST_COMPLETION,
});
