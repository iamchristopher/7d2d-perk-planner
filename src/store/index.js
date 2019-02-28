import {
    applyMiddleware,
    combineReducers,
    compose,
    createStore,
} from 'redux';

import attributes from './modules/attributes';
import localization from './modules/localization';
import perks from './modules/perks';
import selections from './modules/selections';
import skills from './modules/skills';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export default (initialState = {}) => createStore(
    combineReducers({
        attributes,
        localization,
        perks,
        selections,
        skills,
    }),
    initialState,
    composeEnhancers(
        applyMiddleware(
        ),
    ),
);
