import { Record, List, Map, Set } from 'immutable';
import _mapValues from 'lodash.mapvalues';

import BoobenValue, {
  SourceDataStatic,
  SourceDataOwnerProp,
  SourceDataData,
  QueryPathStep,
  SourceDataConst,
  SourceDataFunction,
  SourceDataActions,
  Action,
  ActionTypes,
  MutationActionParams,
  NavigateActionParams,
  URLActionParams,
  MethodCallActionParams,
  PropChangeActionParams,
  AJAXActionParams,
  LoadMoreDataActionParams,
  SourceDataDesigner,
  SourceDataState,
  SourceDataRouteParams,
  SourceDataActionArg,
} from './BoobenValue';

import {
  isUndef,
  isObject,
  isNumber,
  mapListToArray,
  mapMapToObject,
  returnArg,
  returnSecondArg,
  returnNull,
} from '../utils/misc';

import { INVALID_ID } from '../constants/misc';

const ProjectComponentRecord = Record({
  id: INVALID_ID,
  parentId: INVALID_ID,
  isNew: false,
  isWrapper: false,
  style: '',
  name: '',
  title: '',
  props: Map(),
  systemProps: Map(),
  children: List(),
  layout: 0,
  regionsEnabled: Set(),
  routeId: INVALID_ID,
  isIndexRoute: false,
});

const VALID_PATH_STEPS = new Set(['props', 'systemProps']);

ProjectComponentRecord.isValidPathStep = step => VALID_PATH_STEPS.has(step);
ProjectComponentRecord.expandPathStep = step => [step];


/* eslint-disable no-use-before-define */
const actionsToImmutable = actions => List(actions.map(action => {
  const data = {
    type: action.type,
  };

  switch (action.type) {
    case ActionTypes.MUTATION: {
      data.params = new MutationActionParams({
        mutation: action.params.mutation,
        args: Map(_mapValues(action.params.args, boobenValueToImmutable)),
        successActions: actionsToImmutable(action.params.successActions),
        errorActions: actionsToImmutable(action.params.errorActions),
      });

      break;
    }

    case ActionTypes.NAVIGATE: {
      data.params = new NavigateActionParams({
        routeId: action.params.routeId,
        routeParams: Map(_mapValues(
          action.params.routeParams,
          boobenValueToImmutable,
        )),
      });

      break;
    }

    case ActionTypes.URL: {
      data.params = new URLActionParams({
        url: action.params.url,
        newWindow: action.params.newWindow,
      });

      break;
    }

    case ActionTypes.METHOD: {
      data.params = new MethodCallActionParams({
        componentId: action.params.componentId,
        method: action.params.method,
        args: List(action.params.args.map(boobenValueToImmutable)),
      });

      break;
    }

    case ActionTypes.PROP: {
      data.params = new PropChangeActionParams({
        componentId: action.params.componentId,
        propName: action.params.propName || '',
        systemPropName: action.params.systemPropName || '',
        value: boobenValueToImmutable(action.params.value),
      });

      break;
    }

    case ActionTypes.AJAX: {
      data.params = new AJAXActionParams({
        url: boobenValueToImmutable(action.params.url),
        method: action.params.method,
        headers: Map(action.params.headers),
        body: action.params.body === null
          ? null
          : boobenValueToImmutable(action.params.body),
        mode: action.params.mode,
        decodeResponse: action.params.decodeResponse,
        successActions: actionsToImmutable(action.params.successActions),
        errorActions: actionsToImmutable(action.params.errorActions),
      });

      break;
    }

    case ActionTypes.LOAD_MORE_DATA: {
      data.params = new LoadMoreDataActionParams({
        componentId: action.params.componentId,
        pathToDataValue: List(action.params.pathToDataValue),
        successActions: actionsToImmutable(action.params.successActions),
        errorActions: actionsToImmutable(action.params.errorActions),
      });

      break;
    }

    default: {
      data.params = null;
    }
  }

  return Action(data);
}));

/**
 *
 * @param {?PlainBoobenValue} plainValue
 * @return {?Object}
 */
export const boobenValueToImmutable = plainValue => {
  if (plainValue === null) {
    return null;
  }

  const { source, sourceData } = plainValue;

  return new BoobenValue({
    source,
    sourceData: sourceDataToImmutable(source, sourceData),
  });
};

const propSourceDataToImmutableFns = {
  [BoobenValue.Source.CONST]: input => new SourceDataConst(input),
  [BoobenValue.Source.STATIC]: input => {
    const data = {};

    if (!isUndef(input.value)) {
      if (Array.isArray(input.value)) {
        data.value = List(input.value.map(boobenValueToImmutable),
        );
      } else if (isObject(input.value)) {
        data.value = Map(_mapValues(input.value, boobenValueToImmutable));
      } else {
        data.value = input.value;
      }
    }

    return new SourceDataStatic(data);
  },

  [BoobenValue.Source.OWNER_PROP]: input => new SourceDataOwnerProp(input),
  [BoobenValue.Source.DATA]: input => {
    const data = {
      queryPath: input.queryPath
        ? List(input.queryPath.map(step => new QueryPathStep({
          field: step.field,
          connectionPageSize: step.connectionPageSize,
        })))
        : null,

      queryArgs: Map(_mapValues(input.queryArgs, args =>
        Map(_mapValues(args, boobenValueToImmutable)))),

      dataContext: input.dataContext
        ? List(input.dataContext)
        : List(),
    };

    return new SourceDataData(data);
  },

  [BoobenValue.Source.FUNCTION]: input => new SourceDataFunction({
    functionSource: input.functionSource,
    function: input.function,
    args: List(input.args.map(boobenValueToImmutable)),
  }),

  [BoobenValue.Source.ACTIONS]: input => new SourceDataActions({
    actions: actionsToImmutable(input.actions),
  }),

  [BoobenValue.Source.DESIGNER]: input => new SourceDataDesigner(
    input.component
      ? {
        rootId: input.component.id,
        components: componentsToImmutable(
          input.component,
          INVALID_ID,
          false,
          INVALID_ID,
        ),
      }

      : {
        rootId: INVALID_ID,
      },
  ),

  [BoobenValue.Source.STATE]: input => new SourceDataState(input),
  [BoobenValue.Source.ROUTE_PARAMS]: input => new SourceDataRouteParams(input),
  [BoobenValue.Source.ACTION_ARG]: input => new SourceDataActionArg(input),
};
/* eslint-enable no-use-before-define */

export const sourceDataToImmutable = (source, sourceData) =>
  propSourceDataToImmutableFns[source](sourceData);

const propsToImmutable = props => Map(_mapValues(props, boobenValueToImmutable));

export const projectComponentToImmutable = (
  input,
  routeId,
  isIndexRoute,
  parentId,
) => new ProjectComponentRecord({
  id: input.id,
  parentId,
  isNew: !!input.isNew,
  isWrapper: !!input.isWrapper,
  name: input.name,
  title: input.title,
  style: input.style || '',
  props: propsToImmutable(input.props),
  systemProps: propsToImmutable(input.systemProps),
  children: List(input.children.map(childComponent => childComponent.id)),
  layout: isNumber(input.layout) ? input.layout : 0,
  regionsEnabled: input.regionsEnabled ? Set(input.regionsEnabled) : Set(),
  routeId,
  isIndexRoute,
});

/**
 *
 * @param {ProjectComponent} input
 * @param {number} [routeId=INVALID_ID]
 * @param {boolean} [isIndexRoute=false]
 * @param {number} [parentId=INVALID_ID]
 * @return {Immutable.Map<number, Object>}
 */
export const componentsToImmutable = (
  input,
  routeId = INVALID_ID,
  isIndexRoute = false,
  parentId = INVALID_ID,
) => Map().withMutations(mut => {
  const visitComponent = (component, parentId) => {
    mut.set(
      component.id,
      projectComponentToImmutable(component, routeId, isIndexRoute, parentId),
    );

    component.children.forEach(childComponent =>
      void visitComponent(childComponent, component.id));
  };

  visitComponent(input, parentId);
});

/* eslint-disable no-use-before-define */
const actionParamsToJSv1Converters = {
  [ActionTypes.MUTATION]: params => ({
    mutation: params.mutation,
    args: mapMapToObject(params.args, returnSecondArg, boobenValueToJSv1),
    successActions: mapListToArray(params.successActions, actionToJSv1),
    errorActions: mapListToArray(params.errorActions, actionToJSv1),
  }),

  [ActionTypes.METHOD]: params => ({
    componentId: params.componentId,
    method: params.method,
    args: mapListToArray(params.args, boobenValueToJSv1),
  }),

  [ActionTypes.PROP]: params => {
    const ret = {
      componentId: params.componentId,
      value: boobenValueToJSv1(params.value),
    };

    if (params.systemPropName) {
      ret.systemPropName = params.systemPropName;
    } else {
      ret.propName = params.propName;
    }

    return ret;
  },

  [ActionTypes.NAVIGATE]: params => ({
    routeId: params.routeId,
    routeParams: mapMapToObject(
      params.routeParams,
      returnSecondArg,
      boobenValueToJSv1,
    ),
  }),

  [ActionTypes.URL]: params => params.toJS(),

  [ActionTypes.LOGOUT]: returnNull,

  [ActionTypes.AJAX]: params => ({
    url: boobenValueToJSv1(params.url),
    method: params.method,
    headers: params.headers.toJS(),
    body: params.body === null ? null : boobenValueToJSv1(params.body),
    mode: params.mode,
    decodeResponse: params.decodeResponse,
    successActions: mapListToArray(params.successActions, actionToJSv1),
    errorActions: mapListToArray(params.errorActions, actionToJSv1),
  }),

  [ActionTypes.LOAD_MORE_DATA]: params => ({
    componentId: params.componentId,
    pathToDataValue: params.pathToDataValue.toJS(),
    successActions: mapListToArray(params.successActions, actionToJSv1),
    errorActions: mapListToArray(params.errorActions, actionToJSv1),
  }),
};

const actionToJSv1 = action => ({
  type: action.type,
  params: actionParamsToJSv1Converters[action.type](action.params),
});

const sourceDataToJSv1Converters = {
  [BoobenValue.Source.CONST]: sourceData => ({
    value: sourceData.value,
  }),

  [BoobenValue.Source.STATIC]: sourceData => {
    if (sourceData.value instanceof List) {
      return {
        value: mapListToArray(sourceData.value, boobenValueToJSv1),
      };
    } else if (sourceData.value instanceof Map) {
      return {
        value: mapMapToObject(
          sourceData.value,
          returnSecondArg,
          boobenValueToJSv1,
        ),
      };
    } else {
      return {
        value: sourceData.value,
      };
    }
  },

  [BoobenValue.Source.OWNER_PROP]: sourceData => ({
    ownerPropName: sourceData.ownerPropName,
  }),

  [BoobenValue.Source.DATA]: sourceData => ({
    dataContext: mapListToArray(sourceData.dataContext, returnArg),
    queryPath: sourceData.queryPath === null
      ? null
      : mapListToArray(sourceData.queryPath, step => step.toJS()),

    queryArgs: mapMapToObject(
      sourceData.queryArgs,
      returnSecondArg,
      args => mapMapToObject(args, returnSecondArg, boobenValueToJSv1),
    ),
  }),

  [BoobenValue.Source.FUNCTION]: sourceData => ({
    functionSource: sourceData.functionSource,
    function: sourceData.function,
    args: mapListToArray(sourceData.args, boobenValueToJSv1),
  }),

  [BoobenValue.Source.ACTIONS]: sourceData => ({
    actions: mapListToArray(sourceData.actions, actionToJSv1),
  }),

  [BoobenValue.Source.DESIGNER]: sourceData => {
    if (sourceData.rootId === INVALID_ID) {
      return {
        component: null,
      };
    } else {
      return {
        component: projectComponentToJSv1(
          sourceData.components,
          sourceData.rootId,
        ),
      };
    }
  },

  [BoobenValue.Source.STATE]: sourceData => sourceData.toJS(),
  [BoobenValue.Source.ROUTE_PARAMS]: sourceData => sourceData.toJS(),
  [BoobenValue.Source.ACTION_ARG]: sourceData => sourceData.toJS(),
};
/* eslint-enable no-use-before-define */

const sourceDataToJSv1 = (source, sourceData) =>
  sourceDataToJSv1Converters[source](sourceData);

const boobenValueToJSv1 = boobenValue => ({
  source: boobenValue.source,
  sourceData: sourceDataToJSv1(boobenValue.source, boobenValue.sourceData),
});

export const projectComponentToJSv1 = (components, componentId) => {
  const component = components.get(componentId);

  return {
    id: component.id,
    name: component.name,
    title: component.title,
    style: component.style,
    isWrapper: component.isWrapper,
    props: mapMapToObject(
      component.props,
      returnSecondArg,
      boobenValueToJSv1,
    ),
    systemProps: mapMapToObject(
      component.systemProps,
      returnSecondArg,
      boobenValueToJSv1,
    ),
    layout: component.layout,
    regionsEnabled: component.regionsEnabled,
    children: mapListToArray(
      component.children,
      childId => projectComponentToJSv1(components, childId),
    ),
  };
};

export default ProjectComponentRecord;
