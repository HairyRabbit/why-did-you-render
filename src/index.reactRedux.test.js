import React from 'react'
import {createStore} from 'redux'
import {connect, Provider} from 'react-redux'
import {cloneDeep} from 'lodash'
import * as rtl from 'react-testing-library'
import 'jest-dom/extend-expect'
import {diffTypes} from './consts'

import whyDidYouRender from './index'

describe('react-redux', () => {
  const initialState = {a: {b: 'c'}}

  const rootReducer = (state, action) => {
    if(action.type === 'differentState'){
      return {a: {b: 'd'}}
    }

    if(action.type === 'deepEqlState'){
      return cloneDeep(state)
    }

    return state
  }

  let store
  let updateInfos

  beforeEach(() => {
    store = createStore(rootReducer, initialState)
    updateInfos = []
    whyDidYouRender(React, {
      notifier: updateInfo => updateInfos.push(updateInfo)
    })
  })

  afterEach(() => {
    if(React.__REVERT_WHY_DID_YOU_RENDER__){
      React.__REVERT_WHY_DID_YOU_RENDER__()
    }
  })

  test('same state after dispatch', () => {
    const SimpleComponent = ({a}) => (
      <div data-testid="foo">{a.b}</div>
    )

    const ConnectedSimpleComponent = connect(
      state => ({a: state.a})
    )(SimpleComponent)
    ConnectedSimpleComponent.whyDidYouRender = true

    const Main = () => (
      <Provider store={store}>
        <ConnectedSimpleComponent/>
      </Provider>
    )

    rtl.render(<Main/>)

    expect(store.getState().a.b).toBe('c')

    rtl.act(() => {
      store.dispatch({type: 'sameState'})
    })

    expect(store.getState().a.b).toBe('c')

    expect(updateInfos).toHaveLength(0)
  })

  test('different state after dispatch', () => {
    const SimpleComponent = ({a}) => (
      <div data-testid="foo">{a.b}</div>
    )

    const ConnectedSimpleComponent = connect(
      state => ({a: state.a})
    )(SimpleComponent)
    ConnectedSimpleComponent.whyDidYouRender = true

    const Main = () => (
      <Provider store={store}>
        <ConnectedSimpleComponent/>
      </Provider>
    )

    rtl.render(<Main/>)

    expect(store.getState().a.b).toBe('c')

    rtl.act(() => {
      store.dispatch({type: 'differentState'})
    })

    expect(store.getState().a.b).toBe('d')

    expect(updateInfos).toHaveLength(4)
    expect(updateInfos[0].reason).toEqual({
      propsDifferences: false,
      stateDifferences: false,
      hookDifferences: expect.not.arrayContaining([
        expect.objectContaining({diffType: diffTypes.deepEquals})
      ])
    })
    expect(updateInfos[1].reason).toEqual({
      propsDifferences: false,
      stateDifferences: false,
      hookDifferences: expect.not.arrayContaining([
        expect.objectContaining({diffType: diffTypes.deepEquals})
      ])
    })
    expect(updateInfos[2].reason).toEqual({
      propsDifferences: false,
      stateDifferences: false,
      hookDifferences: expect.not.arrayContaining([
        expect.objectContaining({diffType: diffTypes.deepEquals})
      ])
    })
    expect(updateInfos[3].reason).toEqual({
      propsDifferences: false,
      stateDifferences: false,
      hookDifferences: expect.not.arrayContaining([
        expect.objectContaining({diffType: diffTypes.deepEquals})
      ])
    })
  })

  test('deep equals state after dispatch', () => {
    const SimpleComponent = ({a}) => (
      <div data-testid="foo">
        {a.b}
      </div>
    )

    const ConnectedSimpleComponent = connect(
      state => ({a: state.a})
    )(SimpleComponent)
    ConnectedSimpleComponent.whyDidYouRender = true

    const Main = () => (
      <Provider store={store}>
        <ConnectedSimpleComponent/>
      </Provider>
    )

    const tester = rtl.render(<Main/>)

    expect(store.getState().a.b).toBe('c')

    rtl.act(() => {
      store.dispatch({type: 'deepEqlState'})
    })

    expect(store.getState().a.b).toBe('c')
    expect(tester.getByTestId('foo')).toHaveTextContent('c')

    expect(updateInfos).toHaveLength(4)
    expect(updateInfos[0].reason).toEqual({
      propsDifferences: false,
      stateDifferences: false,
      hookDifferences: expect.not.arrayContaining([
        expect.objectContaining({diffType: diffTypes.deepEquals})
      ])
    })
    expect(updateInfos[1].reason).toEqual({
      propsDifferences: false,
      stateDifferences: false,
      hookDifferences: expect.arrayContaining([
        expect.objectContaining({diffType: diffTypes.deepEquals})
      ])
    })
    expect(updateInfos[2].reason).toEqual({
      propsDifferences: false,
      stateDifferences: false,
      hookDifferences: expect.arrayContaining([
        expect.objectContaining({diffType: diffTypes.deepEquals})
      ])
    })
    expect(updateInfos[3].reason).toEqual({
      propsDifferences: false,
      stateDifferences: false,
      hookDifferences: expect.arrayContaining([
        expect.objectContaining({diffType: diffTypes.deepEquals})
      ])
    })
  })
})

describe('react-redux using include', () => {
  const initialState = {a: {b: 'c'}}

  const rootReducer = (state, action) => {
    if(action.type === 'differentState'){
      return {a: {b: 'd'}}
    }

    if(action.type === 'deepEqlState'){
      return cloneDeep(state)
    }

    return state
  }

  let store
  let updateInfos

  beforeEach(() => {
    store = createStore(rootReducer, initialState)
    updateInfos = []
    whyDidYouRender(React, {
      notifier: updateInfo => updateInfos.push(updateInfo),
      include: [/^ConnectFunction$/]
    })
  })

  afterEach(() => {
    if(React.__REVERT_WHY_DID_YOU_RENDER__){
      React.__REVERT_WHY_DID_YOU_RENDER__()
    }
  })

  test('deep equals state after dispatch', () => {
    const SimpleComponent = ({a}) => (
      <div data-testid="foo">
        {a.b}
      </div>
    )

    const ConnectedSimpleComponent = connect(
      state => ({a: state.a})
    )(SimpleComponent)

    const Main = () => (
      <Provider store={store}>
        <ConnectedSimpleComponent/>
      </Provider>
    )

    const tester = rtl.render(<Main/>)

    expect(store.getState().a.b).toBe('c')

    rtl.act(() => {
      store.dispatch({type: 'deepEqlState'})
    })

    expect(store.getState().a.b).toBe('c')
    expect(tester.getByTestId('foo')).toHaveTextContent('c')

    expect(updateInfos).toHaveLength(4)
    expect(updateInfos[0].reason).toEqual({
      propsDifferences: false,
      stateDifferences: false,
      hookDifferences: expect.not.arrayContaining([
        expect.objectContaining({diffType: diffTypes.deepEquals})
      ])
    })
    expect(updateInfos[1].reason).toEqual({
      propsDifferences: false,
      stateDifferences: false,
      hookDifferences: expect.arrayContaining([
        expect.objectContaining({diffType: diffTypes.deepEquals})
      ])
    })
    expect(updateInfos[2].reason).toEqual({
      propsDifferences: false,
      stateDifferences: false,
      hookDifferences: expect.arrayContaining([
        expect.objectContaining({diffType: diffTypes.deepEquals})
      ])
    })
    expect(updateInfos[3].reason).toEqual({
      propsDifferences: false,
      stateDifferences: false,
      hookDifferences: expect.arrayContaining([
        expect.objectContaining({diffType: diffTypes.deepEquals})
      ])
    })
  })
})
