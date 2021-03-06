import { createSelector } from 'reselect';
import IntlMessageFormat from 'intl-messageformat';
import _forOwn from 'lodash.forown';
import { List, Map } from 'immutable';
import { getTypeNameByPath } from 'booben-graphql-schema';

import {
  getComponentMeta,
  findPropThatPushedDataContext,
  isValidSourceForValue,
  getSourceConfig,
  getComponentPropName,
  getContainerStyle,
  isCompositeComponent,
} from '../lib/meta';

import { formatComponentTitle } from '../lib/components';
import { isDef, mapListToArray } from '../utils/misc';
import { INVALID_ID } from '../constants/misc';
import { isEmptyListComponent } from '../containers/builders/helpers';

export const haveNestedConstructorsSelector = state =>
  !state.project.nestedConstructors.isEmpty();

export const topNestedConstructorSelector = state =>
  haveNestedConstructorsSelector(state)
    ? state.project.nestedConstructors.first()
    : null;

export const topNestedConstructorDesignerSelector = state =>
  haveNestedConstructorsSelector(state)
    ? state.project.nestedConstructors.first().designer
    : null;

export const currentDesignerSelector = createSelector(
  topNestedConstructorDesignerSelector,
  state => state.project.designer,

  (topNestedConstructorDesigner, projectDesigner) =>
    topNestedConstructorDesigner === null
      ? projectDesigner
      : topNestedConstructorDesigner,
);

export const currentHistoryNodeSelector = createSelector(
  topNestedConstructorSelector,
  state => state.project,

  (topNestedConstructor, projectState) => topNestedConstructor === null
    ? projectState
    : topNestedConstructor,
);

export const currentRouteSelector = state =>
  state.project.currentRouteId !== INVALID_ID
    ? state.project.data.routes.get(state.project.currentRouteId)
    : null;

export const currentComponentsSelector = createSelector(
  topNestedConstructorSelector,
  currentRouteSelector,

  (topNestedConstructor, currentRoute) => {
    if (topNestedConstructor) return topNestedConstructor.components;
    if (currentRoute) return currentRoute.components;
    return Map();
  },
);

// Path in a nested constructor is always relative to components map
// so it must start with component id
const getComponentIdFromNestedConstructor = nestedConstructor =>
  nestedConstructor.path.steps[0];

export const topNestedConstructorComponentSelector = createSelector(
  state => state.project.nestedConstructors,
  currentRouteSelector,

  (nestedConstructors, currentRoute) => {
    if (nestedConstructors.isEmpty()) return null;

    const topNestedConstructor = nestedConstructors.first();
    const componentId =
      getComponentIdFromNestedConstructor(topNestedConstructor);

    const components = nestedConstructors.size === 1
      ? currentRoute.components
      : nestedConstructors.get(1).components;

    return components.get(componentId) || null;
  },
);

export const currentRootComponentIdSelector = createSelector(
  topNestedConstructorSelector,
  currentRouteSelector,
  state => state.project.currentRouteIsIndexRoute,

  (topNestedConstructor, currentRoute, currentRouteIsIndexRoute) => {
    if (topNestedConstructor) return topNestedConstructor.rootId;

    if (currentRoute) {
      return currentRouteIsIndexRoute
        ? currentRoute.indexComponent
        : currentRoute.component;
    } else {
      return INVALID_ID;
    }
  },
);

export const disabledComponentIdsSelector = createSelector(
  currentComponentsSelector,
  components => components
    .filter(isEmptyListComponent)
    .keySeq()
    .toSet(),
);

export const selectedComponentIdsSelector = createSelector(
  currentDesignerSelector,
  designer => designer.selectedComponentIds,
);

export const selectedComponentsNumberSelector = state =>
  selectedComponentIdsSelector(state).size;

export const singleComponentSelectedSelector = state =>
  selectedComponentIdsSelector(state).size === 1;

export const firstSelectedComponentIdSelector = state => {
  const ret = selectedComponentIdsSelector(state).first();
  return isDef(ret) ? ret : INVALID_ID;
};

export const singleSelectedComponentSelector = createSelector(
  currentComponentsSelector,
  singleComponentSelectedSelector,
  firstSelectedComponentIdSelector,

  (components, singleComponentSelected, firstSelectedComponentId) =>
    singleComponentSelected
      ? components.get(firstSelectedComponentId)
      : null,
);

export const singleSelectedComponentParentSelector = createSelector(
  currentComponentsSelector,
  singleSelectedComponentSelector,

  (components, selectedComponent) => {
    if (selectedComponent === null) return null;
    if (selectedComponent.parentId === INVALID_ID) return null;
    return components.get(selectedComponent.parentId);
  },
);

export const canDeleteComponentSelector = createSelector(
  state => state.project.meta,
  singleSelectedComponentSelector,
  singleSelectedComponentParentSelector,

  (meta, component, parentComponent) => {
    if (component === null) return false;
    if (parentComponent === null) return true;
    if (component.isWrapper) return false;
    return !isCompositeComponent(parentComponent.name, meta);
  },
);

export const canCopyComponentSelector = createSelector(
  state => state.project.meta,
  singleSelectedComponentSelector,
  singleSelectedComponentParentSelector,

  (meta, component, parentComponent) => {
    if (component === null) return false;
    if (parentComponent === null) return false;
    if (component.isWrapper) return false;
    if (component.name === 'Outlet') return false;
    return !isCompositeComponent(parentComponent.name, meta);
  },
);

export const canMoveComponentSelector = createSelector(
  state => state.project.meta,
  singleSelectedComponentSelector,
  singleSelectedComponentParentSelector,

  (meta, component, parentComponent) => {
    if (component === null) return false;
    if (parentComponent === null) return false;
    if (component.isWrapper) return false;
    return !isCompositeComponent(parentComponent.name, meta);
  },
);

export const canUndoSelector = createSelector(
  currentHistoryNodeSelector,
  historyNode => historyNode.canMoveBack(),
);

export const canRedoSelector = createSelector(
  currentHistoryNodeSelector,
  historyNode => historyNode.canMoveForward(),
);

export const highlightedComponentIdsSelector = createSelector(
  currentDesignerSelector,
  designer => designer.highlightedComponentIds,
);

export const highlightedRouteIdsSelector = createSelector(
  currentDesignerSelector,
  designer => designer.highlightRoutesIds,
);

export const cursorPositionSelector = createSelector(
  state => haveNestedConstructorsSelector(state)
    ? state.project.nestedConstructors.first().cursor
    : null,

  state => state.project.cursor,

  (topNestedConstructorCursor, projectCursor) =>
    topNestedConstructorCursor || projectCursor,
);

export const componentClipboardSelector = createSelector(
  state => haveNestedConstructorsSelector(state)
    ? state.project.nestedConstructors.first().clipboard
    : null,

  state => state.project.clipboard,

  (topNestedConstructorClipboard, projectClipboard) =>
    topNestedConstructorClipboard || projectClipboard,
);

export const expandedTreeItemIdsSelector = createSelector(
  currentDesignerSelector,
  designer => designer.expandedTreeItemIds,
);

export const currentComponentsStackSelector = createSelector(
  state => state.project.nestedConstructors,
  currentRouteSelector,

  (nestedConstructors, currentRoute) =>
    nestedConstructors.map((nestedConstructor, idx, list) => {
      const componentId =
        getComponentIdFromNestedConstructor(nestedConstructor);

      const componentsMap = (idx < list.size - 1)
        ? list.get(idx + 1).components
        : currentRoute.components;

      return componentsMap.get(componentId);
    }),
);

export const availableDataContextsSelector = createSelector(
  state => state.project.meta,
  state => state.project.schema,
  topNestedConstructorSelector,
  topNestedConstructorComponentSelector,
  currentComponentsStackSelector,

  (
    meta,
    schema,
    topNestedConstructor,
    topNestedConstructorComponent,
    currentComponentsStack,
  ) => {
    if (!topNestedConstructor) return [];

    const ownerComponent = topNestedConstructorComponent;
    const ownerComponentMeta = getComponentMeta(ownerComponent.name, meta);
    const ownerComponentDesignerPropMeta =
      topNestedConstructor.valueInfo.valueDef;

    const designerSourceConfig = getSourceConfig(
      ownerComponentDesignerPropMeta,
      'designer',
      ownerComponentMeta.types,
    );

    const dataContexts = [];

    _forOwn(
      designerSourceConfig.props,

      ownerPropMeta => {
        if (!ownerPropMeta.dataContext) return;

        const dataContextOriginData = findPropThatPushedDataContext(
          ownerComponentMeta,
          ownerPropMeta.dataContext,
        );

        if (!dataContextOriginData) return;

        const dataContextOriginValue =
          ownerComponent.props.get(dataContextOriginData.propName);

        if (!dataContextOriginValue.isLinkedWithData()) return;

        const dataContext = dataContextOriginValue.getDataContext()
          .concat(ownerPropMeta.dataContext);

        dataContexts.push(dataContext);
      },
    );

    const depth = currentComponentsStack.size;

    return dataContexts.map(dataContext => {
      const typeName = dataContext.reduce((acc, cur, idx) => {
        const component = currentComponentsStack.get(depth - idx - 1);
        const componentMeta = getComponentMeta(component.name, meta);
        const { propName: dataPropName } =
          findPropThatPushedDataContext(componentMeta, cur);

        // Data props with data context cannot be nested
        const dataPropValue = component.props.get(dataPropName);
        const path = mapListToArray(
          dataPropValue.sourceData.queryPath,
          step => step.field,
        );

        return getTypeNameByPath(schema, path, acc);
      }, schema.queryTypeName);

      return { dataContext, typeName };
    });
  },
);

export const ownerPropsSelector = createSelector(
  topNestedConstructorSelector,

  topNestedConstructor => {
    if (!topNestedConstructor) return null;

    const ownerComponentPropMeta = topNestedConstructor.valueInfo.valueDef;

    return isValidSourceForValue(ownerComponentPropMeta, 'designer')
      ? getSourceConfig(ownerComponentPropMeta, 'designer').props || null
      : null;
  },
);

export const ownerUserTypedefsSelector = createSelector(
  topNestedConstructorSelector,

  topNestedConstructor => {
    if (!topNestedConstructor) return null;
    return topNestedConstructor.valueInfo.userTypedefs;
  },
);

/**
 *
 * @param {Object} state
 * @return {function(id: string, [values]: Object): string}
 */
export const getLocalizedTextFromState = createSelector(
  state => state.app.localization,
  state => state.app.language,

  (localization, language) => (id, values = {}) =>
    new IntlMessageFormat(localization[id], language).format(values),
);

/**
 *
 * @param {Object} state
 * @return {string}
 */
export const containerStyleSelector = createSelector(
  state => state.project.meta,
  getContainerStyle,
);

/**
 *
 * @param {Object}
 * @return {Object}
 */
export const rootDraggedComponentSelector = createSelector(
  state => state.project.draggingComponent,
  state => state.project.draggedComponents,
  state => state.project.draggedComponentId,

  (draggingComponent, draggedComponents, draggedComponentId) => {
    if (!draggingComponent) return null;
    if (draggedComponentId === INVALID_ID) return draggedComponents.get(0);
    return draggedComponents.get(draggedComponentId);
  },
);

export const nestedConstructorBreadcrumbsSelector = createSelector(
  state => state.project.data,
  state => state.project.currentRouteId,
  state => state.project.nestedConstructors,
  state => state.project.meta,
  state => state.project.languageForComponentProps,

  (project, currentRouteId, nestedConstructors, meta, language) => {
    const returnEmpty =
      !project ||
      currentRouteId === -1 ||
      nestedConstructors.isEmpty();

    if (returnEmpty) return List();

    const initialAccumulator = {
      ret: List(),
      components: project.routes.get(currentRouteId).components,
    };

    const reducer = (acc, cur) => {
      const componentId = cur.path.steps[0];
      const isSystemProp = cur.path.steps[1] === 'systemProps';
      const prop = cur.path.steps[2];
      const component = acc.components.get(componentId);
      const title = formatComponentTitle(component);
      const componentMeta = getComponentMeta(component.name, meta);
      const propName = isSystemProp
        ? prop
        : getComponentPropName(componentMeta, prop, language);

      return {
        ret: acc.ret.push(title, propName),
        components: cur.components,
      };
    };

    return nestedConstructors.reduceRight(reducer, initialAccumulator).ret;
  },
);

export const isCanvasClearSelector = createSelector(
  topNestedConstructorSelector,
  currentRouteSelector,
  state => state.project.indexRouteSelected,

  (topNestedConstructor, currentRoute, indexRouteSelected) => {
    if (topNestedConstructor) {
      return topNestedConstructor.rootId === INVALID_ID;
    } else {
      if (!currentRoute) return false;
      return currentRoute.parentId === INVALID_ID &&
        !indexRouteSelected &&
        currentRoute.component === INVALID_ID;
    }
  },
);

export const isProjectDirty = state =>
  state.project.localRevision > state.project.lastSavedRevision;
