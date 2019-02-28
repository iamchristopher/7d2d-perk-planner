import qs from 'qs';

const defaultState = {};

export const encode = (state = defaultState) =>
    Buffer.from(
        JSON.stringify(
            qs.parse(
                state
            )
        )
    )
        .toString('base64')
;

export const decode = (state = encode(defaultState)) =>
    JSON.parse(
        Buffer.from(state, 'base64')
            .toString()
    )
;
