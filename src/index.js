import React from 'react';
import ReactDOM from 'react-dom';
import {
    Provider,
} from 'react-redux';
import qs from 'qs';

import store from './store';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

import * as util from './util';
import localization from './localization.json';
import progression from './progression.json';
import {
    initialState,
} from './store/modules/selections';


const {
    data: selections = util.encode(initialState),
} = qs.parse(window.location.search.substring(1));

const {
    progression: {
        attributes: {
            attribute: attributes,
        },
        perks: {
            perk: perks,
        },
        skills: {
            skill: skills,
        }
    }
} = progression;
const state = {
    attributes,
    localization,
    perks,
    skills,
    selections: util.decode(selections),
};

ReactDOM.render(
    <Provider store={store(state)}>
        <App />
    </Provider>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
