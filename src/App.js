import React from 'react';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import FormControl from 'react-bootstrap/FormControl';
import InputGroup from 'react-bootstrap/InputGroup';
import ListGroup from 'react-bootstrap/ListGroup';
import Navbar from 'react-bootstrap/Navbar';
import Tabs from 'react-bootstrap/Tabs';
import Row from 'react-bootstrap/Row';
import Tab from 'react-bootstrap/Tab';
import {
    connect,
} from 'react-redux';
import {
    BrowserRouter,
    withRouter,
} from 'react-router-dom';
import qs from 'qs';
import {
    CopyToClipboard
} from 'react-copy-to-clipboard';

import * as selections from './store/modules/selections';
import * as util from './util';

const operators = {
    GTE: (a, b) => a >= b,
};

function requirementsMet (requirements, stats, name) {
    const {
        [stats.currentLevel]: {
            requirement: nextLevelRequirements,
        } = {},
    } = requirements;

    if (!nextLevelRequirements) {
        return false;
    }

    let req = Array.isArray(nextLevelRequirements) ? nextLevelRequirements : [ nextLevelRequirements ];

    return req.every(({ _attributes: { name, operation, value } }) =>
        operators[operation](
            stats[name.toLowerCase()],
            value
        )
    );
}

const LevelIndicator = ({
    current = 0,
    max = '-',
    onDecrease = () => {},
    onIncrease = () => {},
    requirementsMet = false,
} = {}) =>
    <div>
        <Button onClick={onDecrease} disabled={current <= 0} size="sm">-</Button>
        &nbsp;{current} / {max}&nbsp;
        <Button onClick={onIncrease} disabled={!requirementsMet || current >= max} size="sm">+</Button>
    </div>
;

const PerkLevelIndicator = withRouter(connect(
    (
        {
            attributes,
            perks,
            selections,
            skills,
        },
        {
            perk,
        }
    ) => {
        const perkData = perks.find(({ _attributes: { name } }) => name === perk);
        const skillData = skills.find(({ _attributes: { name } }) => name === perkData._attributes.parent);
        const attributeData = attributes.find(({ _attributes: { name } }) => name === skillData._attributes.parent);

        return {
            ...perkData,
            currentLevel: selections[perk] || 0,
            playerlevel: selections.playerlevel,
            progressionlevel: selections[attributeData._attributes.name] || 0,
        };
    },
    (
        dispatch,
        {
            perk,
        },
    ) => ({
        decrease: () => dispatch(selections.decreasePerk(perk)),
        increase: () => dispatch(selections.increasePerk(perk)),
    }),
    (
        stateProps,
        dispatchProps,
        ownProps,
    ) => ({
        ...ownProps,
        ...stateProps,
        ...dispatchProps,
        requirementsMet: requirementsMet(
            stateProps.level_requirements,
            {
                currentLevel: stateProps.currentLevel,
                playerlevel: stateProps.playerlevel,
                progressionlevel: stateProps.progressionlevel,
            },
            ownProps.perk,
        ),
        decrease () {
            dispatchProps.decrease();

            const {
                history,
                location: {
                    pathname,
                    search,
                },
                perk,
            } = ownProps;

            const {
                data,
                ...query
            } = qs.parse(search.substring(1));

            const state = util.decode(data);

            return history.replace({
                pathname,
                search: qs.stringify({
                    ...query,
                    data: util.encode({
                        ...state,
                        [perk]: stateProps.currentLevel - 1,
                    }),
                }),
            });
        },
        increase () {
            dispatchProps.increase();

            const {
                history,
                location: {
                    pathname,
                    search,
                },
                perk,
            } = ownProps;

            const {
                data,
                ...query
            } = qs.parse(search.substring(1));

            const state = util.decode(data);

            return history.replace({
                pathname,
                search: qs.stringify({
                    ...query,
                    data: util.encode({
                        ...state,
                        [perk]: stateProps.currentLevel + 1,
                    }),
                }),
            });
        },
    })
)(({
    _attributes: {
        max_level = 5,
    },
    currentLevel,
    decrease,
    increase,
    requirementsMet,
}) =>
    <LevelIndicator
        current={currentLevel}
        max={max_level}
        onDecrease={decrease}
        onIncrease={increase}
        requirementsMet={requirementsMet}
    />
));

const PerkLevel = connect(
    (
        {
            localization,
            perks,
        },
        {
            level,
            perk,
        }
    ) => {
        const {
            effect_group: {
                effect_description: {
                    [level]: {
                        _attributes: {
                            desc_key,
                        } = {}
                    } = {},
                } = {},
            },
        } = perks.find(({ _attributes: { name } }) => name === perk);

        let description = 'N/A';
        if (desc_key) {
            description = localization.find(({ Key }) => Key === desc_key).English
                .replace('\\n', '<br />');
        }

        return {
            description,
            name: 'Level',
        };
    }
)(({
    currentLevel = 0,
    description,
    level = 0,
    name,
} = {}) =>
    <ListGroup.Item>
        <details>
            <summary>
                <Row>
                    <Col>
                        <b>{name} {level + 1}</b>
                    </Col>
                    <Col xs="auto" sm="auto" md="auto" lg="auto">
                        <div>{currentLevel - 1 >= level ? '' : 'Locked'}</div>
                    </Col>
                </Row>
            </summary>
            <span dangerouslySetInnerHTML={{ __html: description }}></span>
        </details>
    </ListGroup.Item>
);

const Perk = connect(
    (
        {
            perks,
            localization,
            selections,
        } = {},
        {
            name: perk,
        }
    ) => {
        const perkData = perks.find(({ _attributes: { name } }) => name === perk);
        const description = localization.find(({ Key }) => Key === perkData._attributes.desc_key).English;
        const name = localization.find(({ Key }) => Key === perkData._attributes.name_key).English;

        return {
            ...perkData,
            currentLevel: selections[perk] || 0,
            description,
            name,
        };
    },
)(({
    _attributes: {
        name: perkId,
    },
    currentLevel,
    description,
    level_requirements,
    name,
} = {}) => ([
    <ListGroup.Item action>
        <details>
            <summary>
                    <Row>
                        <Col>
                            {name}
                        </Col>
                        <Col xs="auto" sm="auto" md="auto" lg="auto">
                            <PerkLevelIndicator
                                perk={perkId}
                            />
                        </Col>
                    </Row>
            </summary>
            <Card.Body>
                <p>{description}</p>
                <ListGroup>
                    {level_requirements.map((_, i) =>
                        <PerkLevel
                            perk={perkId}
                            level={i}
                        />
                    )}
                </ListGroup>
            </Card.Body>
        </details>
    </ListGroup.Item>
]));

const PerkList = connect(
    (
        {
            perks,
        } = {},
        {
            skill,
        }
    ) => ({
        perks: perks
            .filter(({ _attributes: { parent } }) => parent === skill)
            .map(({ _attributes: { name } }) => name),
    }),
)(({ perks }) =>
    perks.map(perk =>
        <Perk name={perk} />
    )
);

const Skill = connect(
    (
        {
            localization,
            skills,
        },
        {
            skill: skillName,
        }
    ) => {
        const skillData = skills.find(({ _attributes: { name } }) => name === skillName);
        const name = localization.find(({ Key }) => Key === skillData._attributes.name_key).English;

        return {
            name,
        };
    }
)(({
    name,
} = {}) =>
    <ListGroup.Item variant="secondary">{name}</ListGroup.Item>
);

const SkillList = connect(
    (
        {
            skills,
        } = {},
        {
            attribute,
        }
    ) => ({
        skills: skills
            .filter(({ _attributes: { parent } }) => parent === attribute)
            .map(({ _attributes: { name } }) => name),
    }),
)(({ skills }) =>
    skills.map(skill => ([
        <Skill
            skill={skill}
        />,
        <PerkList skill={skill} />
    ]))
);

const Attribute = withRouter(connect(
    (
        {
            attributes,
            localization,
            selections,
        } = {},
        {
            name: attributeName,
        }
    ) => {
        const attributeData = attributes.find(({ _attributes: { name } }) => name === attributeName);
        const name = localization.find(({ Key }) => Key === attributeData._attributes.name_key).English;

        return {
            ...attributeData,
            currentLevel: selections[attributeName],
            name,
        };
    },
    (
        dispatch,
        {
            name: attributeName,
        }
    ) => ({
        decrease: () => dispatch(selections.decreaseAttribute(attributeName)),
        increase: () => dispatch(selections.increaseAttribute(attributeName)),
    }),
    (
        stateProps,
        dispatchProps,
        ownProps,
    ) => ({
        ...ownProps,
        ...stateProps,
        ...dispatchProps,
        decrease () {
            dispatchProps.decrease();

            const {
                history,
                location: {
                    pathname,
                    search,
                },
                name,
            } = ownProps;

            const {
                data,
                ...query
            } = qs.parse(search.substring(1));

            const state = util.decode(data);

            return history.replace({
                pathname,
                search: qs.stringify({
                    ...query,
                    data: util.encode({
                        ...state,
                        [name]: stateProps.currentLevel - 1,
                    }),
                }),
            });
        },
        increase () {
            dispatchProps.increase();

            const {
                history,
                location: {
                    pathname,
                    search,
                },
                name,
            } = ownProps;

            const {
                data,
                ...query
            } = qs.parse(search.substring(1));

            const state = util.decode(data);

            return history.replace({
                pathname,
                search: qs.stringify({
                    ...query,
                    data: util.encode({
                        ...state,
                        [name]: stateProps.currentLevel + 1,
                    }),
                }),
            });
        },
    })
)(({
    currentLevel,
    decrease,
    increase,
    level_requirements,
    name,
} = {}) =>
    <ListGroup.Item variant="primary">
        <Row>
            <Col>
                <b>{name}</b>
            </Col>
            <Col xs="auto" sm="auto" md="auto" lg="auto">
                <LevelIndicator
                    current={currentLevel}
                    max={level_requirements.length}
                    onDecrease={decrease}
                    onIncrease={increase}
                    requirementsMet={true}
                />
            </Col>
        </Row>
    </ListGroup.Item>
));

const SkillTree = connect(
    ({
        attributes,
        localization,
    }) => ({
        attributes: attributes
            .map(({ _attributes: { name, name_key } }) => ({
                key: name,
                name: localization.find(({ Key }) => Key === name_key).English
                    .replace('Attribute: ', '')
            })),
    }),
)(({ attributes }) =>
    <Tabs>
        {attributes.map(attribute =>
            <Tab eventKey={attribute.key} title={attribute.name} style={{ padding: 20 }}>
                <ListGroup>
                    <Attribute name={attribute.key} />
                    <SkillList attribute={attribute.key} />
                </ListGroup>
            </Tab>
        )}
    </Tabs>
);

const BuildForm = withRouter(connect(
    ({
        selections,
    }) => ({
        buildUrl: `${window.location.origin}${window.location.pathname}?data=${util.encode(selections)}`,
    })
)(({ buildUrl }) =>
    <InputGroup size="sm">
        <FormControl value={buildUrl} />
        <InputGroup.Append>
            <CopyToClipboard text={buildUrl}>
                <Button>Copy</Button>
            </CopyToClipboard>
        </InputGroup.Append>
    </InputGroup>
));

export default connect(
    ({
        selections: {
            completedTraderQuest,
            playerlevel,
            ...selections
        } = {},
    }) => ({
        completedTraderQuest,
        playerlevel,
        skillPointsUsed: Object.values(selections).reduce((total, i) => total += i, 0)
    }),
    dispatch => ({
        toggleTraderQuestCompletion: () => dispatch(selections.toggleTraderQuestCompletion()),
    })
)(({
    completedTraderQuest,
    playerlevel,
    skillPointsUsed,
    toggleTraderQuestCompletion,
} = {}) =>
    <BrowserRouter>
        <div>
        <Navbar bg="light" variant="light" sticky="top">
            <Navbar.Brand>
                7 Days to Die Perk Planner
            </Navbar.Brand>
            <Navbar.Collapse className="justify-content-end">
                <BuildForm />
            </Navbar.Collapse>
        </Navbar>
            <p>
                Character level: {playerlevel}
            </p>
            <p>
                Skill points used: {skillPointsUsed} / {1 * playerlevel + (completedTraderQuest ? 5 : 0)} <Button variant="link">Respec</Button>
            </p>
        <p>

            <input
                checked={completedTraderQuest}
                id="completedTraderQuest"
                onChange={toggleTraderQuestCompletion}
                type="checkbox"
            /> Trader quest complete
        </p>

        <SkillTree />
        </div>
    </BrowserRouter>
);

/*

                <Row>
                    <Col>
                        <img src="logo.png" style={{
                            height: 'auto',
                            maxHeight: '100px',
                            maxWidth: '90%'
                        }} />
                    </Col>
                    <Col xs="auto" sm="auto" md="auto" lg="auto">
                        <InputGroup>
                            <FormControl
                                placeholder="http://localhost:3000/"
                            />
                            <InputGroup.Append>
                                <InputGroup.Text>Copy</InputGroup.Text>
                            </InputGroup.Append>
                        </InputGroup>
                    </Col>
                </Row>
 */
